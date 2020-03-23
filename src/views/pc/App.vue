<template>
  <div class="pc">
    <p>pc page</p>
    <p>ua: {{ ua }}</p>
    <p>random str: {{ data.id }}</p>
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
.pc {
  height: 400px;
  width: 400px;
  text-align: center;
}
</style>