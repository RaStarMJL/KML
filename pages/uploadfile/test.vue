<template>
    <view style="padding: 25rpx 30rpx;">
        <button @click="choose">文件选择</button>
    </view>

</template>

<script setup lang="ts">
    import { ref } from 'vue';
    const selectedFilePath = ref('');
    const localsign = ref('17440226792765lHUm6giPo+qlhs0L88CNd//204emkfcxtssEjYy2xs=');

    const uploadTask = () => {
        uni.uploadFile({
      url: 'https://www.das-ai.com/open/api/v2/agent/file/upload', // 替换为你的API地址
      filePath: selectedFilePath.value || '',
      name: 'file',
      header: {
        'Content-Type': 'multipart/form-data',
		'Accept': 'application/json',
        'appKey': 'hengnaozYW3SnQJNy5hIzs2pp8w',
        'sign': localsign.value
      },

      success: (uploadRes) => {
		console.log('上传成功后的uploadRes:',uploadRes);
      },
    });
}
   
    const plugin = uni.requireNativePlugin('GW-ChooseFileModule')
    const choose = () =>{
        console.log('开始选择文件')
       plugin.chooseFile(
    {
        // 非必填，选择文件最大数量
        count: 1,

        // 非必填，指定文件扩展名
        extension: ["docx", "pptx", "pdf"],

        // 非必填，指定目录，可指定任意多个目录
        paths: [
            {
                deep: true, // deep为true表示扫描文件包含指定目录及以下的全部子目录，false表示只扫描指定目录下一级的文件
                path: 'Download' // 指定根目录下的相对目录，不用写根目录（/storage/emulated/0）
            },
            {
                deep: true,
                path: 'Documents'
            }
        ]
    },
    res => {
        console.log(res)
        selectedFilePath.value = "file://" + res.files[0].path
        uploadTask()
        /*
        返回示例
        {
            "files": [
                {
                     // 本地存储路径，uni 上传前面需要添加 file://
                    "path": "/storage/emulated/0/Download/a.xlsx",

                     // 文件名
                    "name": "a.xlsx",

                     // 最后修改时间(毫秒)
                    "lastModified": 1658113714000,

                    // 大小(Byte)
                    "size": 10049,

                     // 扩展名
                    "extension": "xlsx",

                    // mimeType
                    "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            ]
        }
        */
    }

    
)
    }
</script>

<style>
    page{
        background: #fff;
    }
</style>