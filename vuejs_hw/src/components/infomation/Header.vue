<script>
export default {
  
  computed: {
    objectCount() {
      return this.objects.filter((object) => object.title.length > 2).length
    },
  },
  props: {
    objects: {
      type: Array,
      required: true,
      default: [],
    },
  },
}
</script>

<template>
  <h2 class=" m-2" v-if="objects.length == 0">目前無任何資料</h2>
  <h2 class=" m-2" v-if="objects.length == 0">test</h2>
</template>
