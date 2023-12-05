<template>
  <div class="container mx-auto">
    <div class="flex items-center gap-2 mt-4">
      <input 
        v-model.trim="objectName"
        @keydown.enter="addObject"
        type="text" 
        placeholder="做點重要的事吧..." 
        class="w-full 
        text-2xl 
        focus:outline-none 
        input-lg input 
        input-bordered 
        rounded-none">
      <button class="text-xl btn-lg btn btn-neutral rounded-none" @click="addObject">新增</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      objectName: "",
    }
  },
  methods: {
    addObject() {
      this.$emit("add-object", this.objectName)
      this.objectName = ""
    },
  },
}
</script>