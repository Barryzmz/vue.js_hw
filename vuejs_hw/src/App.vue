<template>
  <div class="container mx-auto">
    <h1 class="title m-2">{{ title }}</h1>
    <p>simple and study todo app</p>
    <AddObjectForm @add-object="addObject" />
    <div class="divider"></div>
    <div>
      <Header :objects="objects" />
      <ul>
        <ObjectItem @remove-object="removeObject" v-for="object in objects" :object="object" />
      </ul>
    </div>
  </div>
</template>

<script>
import { v4 as uuid } from "uuid"
import ObjectItem from "./components/objects/Item.vue"
import AddObjectForm from "./components/forms/AddObject.vue"
import { getObjects, saveObjects } from "@/lib/storage"
import Header from "./components/infomation/Header.vue"

export default {
  data() {
    return {
      title: "TODO!",
      objects: [],
    }
  },

  components: { 
    Header, 
    ObjectItem, 
    AddObjectForm 
  },

  methods: {
    removeObject(id) {
      if (id) {
        const objectIndex = this.objects.findIndex((object) => object.id == id)

        if (objectIndex >= 0) {
          this.objects.splice(objectIndex, 1)
          saveObjects(this.objects)
        }
      }
    },

    beforeMount: function () {
      const objects = getObjects()
      if (objects) {
        this.objects = objects
      }
    },

    addObject(objectName) {
      if (objectName != "") {
        const object = {
          id: uuid(),
          title: objectName,
        }
        this.objects.unshift(object)
        saveObjects(this.objects)
      }
    },
  },
}
</script>


<style scoped>
.title {
  @apply text-slate-800 text-5xl;
}
</style>
