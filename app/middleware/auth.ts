export default defineNuxtRouteMiddleware((to, from) => {
  // Authentication is handled by the admin layout which shows a login dialog
  // This middleware is kept to mark routes that require authentication context
})
