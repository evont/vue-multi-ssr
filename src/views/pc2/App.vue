<template>
  <div class="pc2">
    <p>pc2 page</p>
    <p>ua: {{ ua }}</p>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  computed: {
    ua() {
      return this.$store.page2.ua || '';
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