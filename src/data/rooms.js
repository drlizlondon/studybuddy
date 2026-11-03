// SD-1g: the rooms, as data. A room is a view out of the window plus where Pip's desk sits in it.
//   pip.x, pip.y   centre of Pip's desk, as a percentage of the room (left, top)
//   pip.scale      size of the desk scene, 1 = the default width
//   images         false until the real day and night images exist at the paths below
//                  (they arrive later, Gemini job SD-2). While false, or if an image fails
//                  to load, the room shows its CSS-gradient placeholder and requests nothing.
export const ROOMS = [
  {
    id: "alps",
    name: "Swiss summer",
    day: "/images/rooms/alps-day.webp",
    night: "/images/rooms/alps-night.webp",
    pip: { x: 50, y: 52, scale: 1 },
    images: false,
    placeholder: {
      day:
        "radial-gradient(circle at 80% 14%, rgba(255, 251, 226, 0.95), rgba(255, 251, 226, 0) 20%), " +
        "linear-gradient(162deg, rgba(255, 255, 255, 0) 44%, #dfe9f2 44.4%, #c6d6e6 56%, rgba(255, 255, 255, 0) 56.4%), " +
        "linear-gradient(180deg, #8fc7ee 0%, #cfe6f6 46%, #a9d08c 47%, #6fae5a 70%, #46823f 100%)",
      night:
        "radial-gradient(circle at 80% 14%, rgba(235, 240, 255, 0.85), rgba(235, 240, 255, 0) 12%), " +
        "linear-gradient(162deg, rgba(0, 0, 0, 0) 44%, #1f2f4a 44.4%, #182640 56%, rgba(0, 0, 0, 0) 56.4%), " +
        "linear-gradient(180deg, #070d1f 0%, #16213d 46%, #1d3a2e 47%, #17301f 70%, #0e2015 100%)"
    }
  },
  {
    id: "country",
    name: "Country views",
    day: "/images/rooms/country-day.webp",
    night: "/images/rooms/country-night.webp",
    pip: { x: 50, y: 52, scale: 1 },
    images: false,
    placeholder: {
      day:
        "radial-gradient(circle at 70% 18%, rgba(255, 244, 214, 0.7), rgba(255, 244, 214, 0) 34%), " +
        "linear-gradient(180deg, #cfe3ee 0%, #efe9cf 44%, #c4cf86 45%, #a2b45f 72%, #7e9244 100%)",
      night:
        "radial-gradient(circle at 70% 18%, rgba(230, 226, 255, 0.55), rgba(230, 226, 255, 0) 24%), " +
        "linear-gradient(180deg, #0c1224 0%, #232846 44%, #2a3320 45%, #1f2917 72%, #141c0f 100%)"
    }
  },
  {
    id: "office",
    name: "Future office",
    day: "/images/rooms/office-day.webp",
    night: "/images/rooms/office-night.webp",
    pip: { x: 50, y: 52, scale: 1 },
    images: false,
    placeholder: {
      day:
        "repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.18) 0 2px, rgba(255, 255, 255, 0) 2px 72px), " +
        "linear-gradient(180deg, #e4f5f8 0%, #bfe2ea 55%, #8dbac7 100%)",
      night:
        "radial-gradient(circle at 24% 30%, rgba(0, 220, 255, 0.28), rgba(0, 220, 255, 0) 30%), " +
        "radial-gradient(circle at 78% 22%, rgba(255, 70, 200, 0.22), rgba(255, 70, 200, 0) 28%), " +
        "repeating-linear-gradient(90deg, rgba(120, 200, 255, 0.1) 0 2px, rgba(0, 0, 0, 0) 2px 72px), " +
        "linear-gradient(180deg, #050b17 0%, #0b2038 55%, #12385a 100%)"
    }
  }
];

export const DEFAULT_ROOM_ID = "country";
export const ROOM_STORAGE_KEY = "studyDoubleRoom";

export const getRoom = (id) => ROOMS.find((room) => room.id === id) ?? ROOMS.find((room) => room.id === DEFAULT_ROOM_ID);
