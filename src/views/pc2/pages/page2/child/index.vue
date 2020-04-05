<template>
  <div class="pc2">
    <p>child</p>
    <p>{{ childData }}</p>
  </div>
</template>

<script>
export default {
  name: "page2-child",
  asyncData(Kit) {
    return Promise.resolve({ childData: 'childData' })
  },
  computed: {
    childData() {
      return this.$store["page2-child"].childData;
    }
  }
};
</script>
<style>
.pc2 {
  height: 400px;
  width: 400px;
  text-align: center;
}
</style>