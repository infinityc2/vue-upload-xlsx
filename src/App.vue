<template>
  <v-app>
    <slot name="buttonUpload">
      <v-btn color="primary" @click="handleUploadClick">Import</v-btn>
    </slot>
    <input
      type="file"
      ref="uploadFile"
      :accept="accept"
      v-show="false"
      @change="handleUploadChange"
    />
  </v-app>
</template>

<script>
import XLSX from "xlsx";

export default {
  props: {
    accept: {
      type: String,
      default: ".xlsx, .xls"
    }
  },
  data: () => ({
    dataFrame: {
      header: [],
      body: []
    },
    workbook: null
  }),
  computed: {
    rABS: () => {
      return window.xlsxEventBus.XLSX_EVENTS_DATA.options.rABS
    }
  },
  methods: {
    handleUploadClick: function() {
      this.clear();
      this.$refs.uploadFile.click();
    },
    handleUploadChange: function(event) {
      let files = event.target.files[0];
      this.convertWorkbook(files)
        .then(workbook => {
          let xlsxArray = XLSX.utils.sheet_to_json(
            workbook.Sheets[workbook.SheetNames[0]]
          );
          this.workbook = workbook;
          this.initialTable(this.xlsxArrToTableArr(xlsxArray));
        })
        .catch(() => {
          this.$emit("SelectFile", false);
        });
    },
    convertWorkbook: function(file) {
      let reader = new FileReader();
      let fix = data => {
        let o = "",
          l = 0,
          w = 10240;
        for (; l < data.byteLength / w; ++l) {
          o += String.fromCharCode.apply(
            null,
            new Uint8Array(data.slice(l * w, l * w + w))
          );
        }
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
      };
      return new Promise((resolve, reject) => {
        try {
          reader.onload = event => {
            let data = event.target.result;
            if (this.rABS) {
              resolve(XLSX.read(data, { type: "binary" }));
            } else {
              resolve(XLSX.read(btoa(fix(data)), { type: "base64" }));
            }
          };
          reader.onerror = error => {
            reject(error);
          };
          if (this.rABS) {
            reader.readAsBinaryString(file);
          } else {
            reader.readAsArrayBuffer(file);
          }
        } catch (error) {
          reject(error);
        }
      });
    },
    xlsxArrToTableArr: function(xlsxArray) {
      let tableArray = [],
        length = 0,
        maxLength = 0,
        maxLengthIndex = 0;
      xlsxArray.forEach((item, index) => {
        length = Object.keys(item).length;
        if (maxLength < length) {
          maxLength = length;
          maxLengthIndex = index;
        }
      });
      let tableHeader = Object.keys(xlsxArray[maxLengthIndex]);
      let row = {};
      xlsxArray.forEach(item => {
        row = {};
        for (let i = 0; i < maxLength; i++) {
          row[tableHeader[i]] = item[tableHeader[i]] || "";
        }
        tableArray.push(row);
      });
      return {
        header: tableHeader,
        data: tableArray
      };
    },
    tableArrToXlsxArr: function({ data, header }) {
      let xlsxArray = [];
      let temp = {};
      data.forEach(row => {
        temp = {};
        row.forEach((item, index) => {
          temp[header[index]] = item;
        });
        xlsxArray.push(temp);
      });
      return xlsxArray;
    },
    initialTable({ data, header }) {
      this.dataFrame.header = header;
      this.dataFrame.body = data;
      this.$emit("SelectFile", this.dataFrame);
    },
    clear: function() {
      this.$refs.uploadFile.value = null;
      this.dataFrame = {
        header: [],
        body: []
      };
      this.workbook = null;
    }
  }
};
</script>