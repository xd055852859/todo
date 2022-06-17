<script setup lang="ts">
import lineChart from "@/components/chart/lineChart.vue";
import { ElMessage } from "element-plus";
onMounted(() => {
  document.addEventListener("paste", function (event: any) {
    console.log(event);
    var isChrome = false;
    if (event.clipboardData || event.originalEvent) {
      //not for ie11  某些chrome版本使用的是event.originalEvent
      var clipboardData =
        event.clipboardData || event.originalEvent.clipboardData;
      console.log(clipboardData);
      if (clipboardData.items) {
        // for chrome
        var items = clipboardData.items,
          len = items.length,
          blob = null;
        isChrome = true;
        //items.length比较有意思，初步判断是根据mime类型来的，即有几种mime类型，长度就是几（待验证）
        //如果粘贴纯文本，那么len=1，如果粘贴网页图片，len=2, items[0].type = 'text/plain', items[1].type = 'image/*'
        //如果使用截图工具粘贴图片，len=1, items[0].type = 'image/png'
        //如果粘贴纯文本+HTML，len=2, items[0].type = 'text/plain', items[1].type = 'text/html'
        // console.log('len:' + len);
        // console.log(items[0]);
        // console.log(items[1]);
        // console.log( 'items[0] kind:', items[0].kind );
        // console.log( 'items[0] MIME type:', items[0].type );
        // console.log( 'items[1] kind:', items[1].kind );
        // console.log( 'items[1] MIME type:', items[1].type );

        //阻止默认行为即不让剪贴板内容在div中显示出来
        event.preventDefault();
        console.log(items);
        //在items里找粘贴的image,据上面分析,需要循环
        for (var i = 0; i < len; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            // console.log(items[i]);
            // console.log( typeof (items[i]));

            //getAsFile() 此方法只是living standard firefox ie11 并不支持
            // blob = items[i].getAsFile();
            console.log(items[i].getAsFile());
          }
        }
      }
    }
  });
});
</script>
<template>
  <!-- <line-chart lineId="LineContentId" :width="'700px'" :height="'500px'"/> -->
</template>
<style scoped lang="scss"></style>
<style></style>
