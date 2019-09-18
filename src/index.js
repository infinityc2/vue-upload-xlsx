import VueUploadXlsx from 'App'

function install(Vue, options = {}) {
    const version = Vue.version.split('.')[0]
    if (version !== '2') console.log('Version not support');
    
    const browser = typeof window !== 'undefined'
    const DEFAULT_OPTION = {
        rABS: false
    }
    let xlsx = {
        $vm: null,
        bindEventBus (vm) {
            this.$vm = vm
        }
    }

    const xlsxOptions = Object.assign(DEFAULT_OPTION, options)
    const xlsxEventBus = new Vue({
        data: {
            XLSX_EVENT_DATA: {
                options: xlsxOptions,
                params: {}
            }
        }
    })

    if (browser) {
        window.xlsxEventBus = xlsxEventBus
        xlsx.bindEventBus(xlsxEventBus)
    }

    Vue.component('vue-upload-xlsx', VueUploadXlsx)
}

export default install

if (typeof module === 'object' && module.exports) {
    module.exports.install = install
}