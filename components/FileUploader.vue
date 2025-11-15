<template>
  <view class="file-uploader">
    <u-upload
      :fileList="fileList"
      @afterRead="afterRead"
      @delete="deleteFile"
      :maxCount="maxCount"
      :name="name"
    ></u-upload>
  </view>
</template>

<script>
export default {
  name: "FileUploader",
  props: {
    maxCount: {
      type: Number,
      default: 1,
    },
    name: {
      type: String,
      default: "file",
    },
    fileType: {
      type: String,
      default: "image",
    },
  },
  data() {
    return {
      fileList: [],
    };
  },
  methods: {
    afterRead(event) {
      console.log("afterRead", event);
      // const { file } = event.file;
      this.upload(event.file);
    },
    deleteFile(event) {
      this.fileList.splice(event.index, 1);
      this.$emit("onDelete", event.index);
    },
    async upload(file) {
      try {
        console.log("Uploading file:", file);
        // 上传文件到云存储
        const uploadResult = await uniCloud.uploadFile({
          filePath: file.url,
          cloudPath: `${this.fileType}/${Date.now()}-${file.name}`,
          fileType: this.fileType,
        });

        // 调用云函数获取公开可访问的URL
        const { result } = await uniCloud.callFunction({
          name: "uploadFile",
          data: {
            fileID: uploadResult.fileID,
          },
        });

        if (result.code === 0) {
          file.url = result.data.publicURL;
          this.fileList.push(file);
          this.$emit("onUpload", result.data.publicURL);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error("Upload failed:", error);
        uni.showToast({
          title: "上传失败，请重试",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.file-uploader {
  // Add any custom styles here
}
</style>
