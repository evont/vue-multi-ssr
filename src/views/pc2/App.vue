<template>
  <div class="pc2">
    <p>pc2 page</p>
    <p>ua: {{ ua }}</p>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  inject: ["$store"],
  asyncData(Kit) {
    return this.methods.fetchData(Kit);
  },
  computed: {
    ua() {
      return this.store.ua || '';
    },
    data() {
      return this.store.data || {};
    }
  },
  mounted() {
    if (!this.store.data) {
      this.fetchData(this.$kit).then(data => {
        this.store = data;
      });
    }
  },
  methods: {
    fetchData(Kit) {
      return Kit.Api.get(
        "https://www.mxnzp.com/api/tools/no_repeat_id/long"
      ).then(res => {
        return {
          ua: Kit.env.userAgent,
          ...res
        };
      });
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