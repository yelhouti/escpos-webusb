/** Declaration file generated by dts-gen */

import { USB, Adapter} from 'escpos'

export = WebUSB;

declare class WebUSB implements Adapter {
    constructor(usbDevice?: USB, configurationValue?: number, interfaceNumber?: number, endpointNumber?: number);

    open(callback?: (error?: any) => void): Adapter;

    write(data: Buffer, callback: (error?: any) => void): Adapter;

}

