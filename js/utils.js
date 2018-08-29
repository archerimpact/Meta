function nospaces(str) {
  return str.replace(/ /g, "…");
}

function withspaces(str) {
  return str.replace(/…/g, " ");
}
