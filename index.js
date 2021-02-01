'use strict';

/**
 *
 * @param {USBDevice} usbDevice
 * @constructor
 */
function WebUSB(usbDevice, configurationValue, interfaceNumber, endpointNumber){
    if (usbDevice) {
        this.device = usbDevice;
        this.configurationValue = configurationValue;
        this.interfaceNumber = interfaceNumber;
        this.endpointNumber = endpointNumber;
    }
}

WebUSB.prototype.open = async function (callback){
    if (!this.device) {
        const printerFilters = [{classCode: 0x07}];
        this.device = await navigator.usb.requestDevice({ filters: printerFilters });
    }
    if (!this.device) {
        callback && callback('No device selected');
        return;
    }
    await this.device.open().catch(err => {
        callback && callback(err);
        return;
    })
    if (!this.device.configuration) {
        if (!this.configurationValue) {
            // TODO give user possibility to choose configuration
            this.configurationValue = this.device.configurations.length === 1 ? this.device.configurations[0].configurationValue : this.device.configurations[0].configurationValue;
        }
        await this.device.selectConfiguration(this.configurationValue);
    }
    const interfaces = this.device.configuration.interfaces.filter(i => i.alternates.some(a => a.endpoints.some(e => e.direction === 'out')));
    if (!this.interfaceNumber) {
        // TODO give user possibility to choose interface
        this.interfaceNumber = interfaces.length === 1 ? interfaces[0].interfaceNumber : interfaces[0].interfaceNumber;
    }
    await this.device.claimInterface(this.interfaceNumber);
    if (!this.endpointNumber) {
        const intfce = interfaces.find(intf => intf.interfaceNumber === this.interfaceNumber);
        const alternates = intfce.alternates.filter(a => a.endpoints.some(e => e.direction === 'out'));
        if (!this.alternateSetting) {
            // TODO give user possibility to choose alternate
            this.alternateSetting = alternates.length === 1 ? alternates[0].alternateSetting : alternates[0].alternateSetting;;
        }
        const alternate = alternates.find(a => a.alternateSetting === this.alternateSetting);
        const endpoints = alternate.endpoints.filter(e => e.direction === 'out');
        // TODO give user possibility to choose endpoint
        this.endpointNumber = endpoints.length === 1 ? endpoints[0] : endpoints[0];
    }
    callback && callback();
}

WebUSB.prototype.write = async function (data, callback) {
    const res = await this.device.transferOut(this.endpointNumber, data);
    // TODO check what to do when status is "stall" | "babble"
    if (res.status !== "ok") {
        callback && callback(res)
    } else {
        callback && callback();
    }
}

module.exports = WebUSB;
