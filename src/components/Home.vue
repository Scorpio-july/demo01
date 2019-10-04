<template>
  <div>
    home
    <el-button type="warning" @click="logout">警告按钮</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout: function() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
