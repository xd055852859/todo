import * as qiniu from "qiniu-js";

export const getSearchParamValue = (search: string, paramName: string) => {
  const QUERY_PARAMS: string = new URLSearchParams(search).get(
    paramName
  ) as string;
  if (QUERY_PARAMS) {
    return QUERY_PARAMS;
  } else {
    return null;
  }
};

// 生成标识符
export const guid = (len, radix) => {
  var chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  var uuid: any = [],
    i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join("");
};

export const uploadImage = (
  file,
  uptoken,
  mimeType,
  callback,
  fileType?: string
) => {
  if (!uptoken) {
    alert("uptoken不存在");
    return;
  }
  if (!file) {
    alert("无文件");
    return;
  }
  const domain = "https://cdn-ttalk.qingtime.cn/";
  if (file.size > 20000000) {
    alert("文件不能大于20M,请重新选择");
    return;
  }
  let putExtra = {
    // 文件原文件名
    fname: "",
    // 自定义变量
    params: {},
    // 限制上传文件类型
    mimeType: mimeType,
  };
  let config = {
    useCdnDomain: true,
    disableStatisticsReport: false,
    retryCount: 5,
    region: qiniu.region.z0,
    forceDirect: true,
  };
  let observer = {
    next(res) {},
    error(err) {
      alert(err.message);
    },
    complete(res) {
      // content = content.replace(/(data:image\/){1}(jpeg|gif|png){1}(;){1}.*?\"/, "http://cdn-icare.qingtime.cn/" + res.key + "\"");
      console.log("domain + res.key", domain + res.key);
      callback(domain + res.key);
      //return domain + res.key;
    },
  };
  // 上传
  let observable = qiniu.upload(
    file,
    fileType
      ? new Date().getTime() + "_workingVip." + fileType
      : new Date().getTime() +
          "_workingVip" +
          (file.name ? file.name.substr(file.name.lastIndexOf(".")) : ".png"),
    uptoken,
    putExtra,
    config
  );
  // 上传开始
  observable.subscribe(observer);
};
