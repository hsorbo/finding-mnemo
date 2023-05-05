function sleep(millis: number) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

async function readWithTimeout(reader: ReadableStreamDefaultReader<Uint8Array>, timeout: number) {
    const timer = setTimeout(() => {
        reader.releaseLock();
    }, timeout);
    const result = await reader.read();
    clearTimeout(timer);
    return result;
}


function concat(arrays: Uint8Array[]) {
    let totalLength = 0;
    for (let arr of arrays) {
        totalLength += arr.length;
    }
    let result = new Uint8Array(totalLength);
    let offset = 0;
    for (let arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}

export function can_import() {
    return "serial" in navigator;
}

const mnemoV1HandShake = () => {
    const date = new Date();
    return new Uint8Array([
        0x43,
        date.getFullYear() - 2000,
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes()]);
}

const mnemoV2HandShake = () => {
    return new TextEncoder().encode("getdata\n");
}

enum ImportProgress {
    Opening,
    Opened,
    Communicating,
    Reading,
}

export async function mnemo_import(callback: (s: ImportProgress) => void) {
    const v1 = { usbVendorId: 1240, usbProductId: 221 };
    const v2 = { usbVendorId: 0x2341, usbProductId: 0x005e }; //0x005e:0x2341 mnemo v2 Nano RP2040 Connect:
    const filters = [v1, v2];
    
    if (!can_import()) {
        throw Error("Web serial not supported");
    }

    const port = await navigator.serial.requestPort({ filters });
    // const ports = await navigator.serial.getPorts();
    // ports.forEach(p => console.log(p.getInfo()));
    // let port = ports.find(p => p.getInfo().usbProductId === v2.usbProductId || p.getInfo().usbProductId === v1.usbProductId);

    if (port === undefined) {
        throw Error("Mnemo not found");
    }
    
    const isV2 = port.getInfo().usbProductId === v2.usbProductId;
    
    callback(ImportProgress.Opening);

    await port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        bufferSize: 8192
    });

    callback(ImportProgress.Communicating);

    if (port.writable === null) {
        throw Error("Can't write to port");
    }

    const writer = port.writable.getWriter();
    
    const data = isV2 ? mnemoV2HandShake():  mnemoV1HandShake();

    for (const x of data) {
        await writer.write(new Uint8Array([x]));
        await sleep(100);
    }
    writer.releaseLock();

    callback(ImportProgress.Reading);
    if (port.readable === null) {
        throw Error("Can't read from port");
    }

    const reader = port.readable.getReader();
    let max = 1000;
    let read = 0;
    const chunks = [];
    while (true) {
        max--;
        if (max === 0) {
            throw Error("Probably deadlocked");
        }
        try {
            const { value, done } = await readWithTimeout(reader, 1000);
            if (value != null) {
                chunks.push(value);
                read += value.length;
            }
            if (done) {
                break;
            }
            //callback(`read ${read} bytes`)
        }
        catch {
            //TODO: Dirty to assume done here....
            break;
        }

        await sleep(100);
    }

    reader.releaseLock();
    port.close();
    return concat(chunks);
}
