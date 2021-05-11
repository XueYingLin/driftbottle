export const STAMPS = [
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

export function getIconById(id) {
  for (const stamp of STAMPS) {
    if (stamp.id === id) return stamp.icon
  }
}

