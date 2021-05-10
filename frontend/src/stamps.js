const STAMPS = [
  {
    id: "skull",
    icon: "fa-skull-crossbones",
  },
  {
    id: "wine",
    icon: "fa-wine-bottle",
  },
  {
    id: "umbrella",
    icon: "fa-umbrella-beach",
  },
  {
    id: "volleyball",
    icon: "fa-volleyball-ball",
  },
  {
    id: "glass",
    icon: "fa-wine-glass-alt",
  },
]

function getIconById(id) {
  for (const stamp of STAMPS) {
    console.log("Compare " + id + " with " + stamp.id)
    if (stamp.id === id) return stamp.icon
  }
}

module.exports = { STAMPS, getIconById }
