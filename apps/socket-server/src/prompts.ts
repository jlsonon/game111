export const PROMPTS = {
  DRAW_GUESS: [
    "Espresso Machine", "Mount Everest", "Cyberpunk City", "Golden Retriever", 
    "Electric Guitar", "Space Shuttle", "Sushi Platter", "Eiffel Tower",
    "Ancient Pyramid", "Robot Dancing", "Hot Air Balloon", "Tropical Island"
  ],
  BLUFF_MASTER: [
    { q: "A group of flamingos is called a...", a: "Flamboyance" },
    { q: "The first vending machine dispensed...", a: "Holy Water" },
    { q: "What was the first fruit grown in space?", a: "Apple" },
    { q: "In Switzerland, it is illegal to own just one...", a: "Guinea Pig" },
    { q: "The inventor of the Pringles can is buried in a...", a: "Pringles Can" }
  ],
  SECRET_SPY: {
    locations: ["Nuclear Submarine", "Zoo", "Movie Studio", "Space Station", "Wedding", "Hospital", "Embassy", "Pirate Ship", "Beach Resort", "Casino"],
  },
  TRIVIA_SHOWDOWN: [
    { q: "Which planet is known as the Red Planet?", a: "Mars", options: ["Mars", "Venus", "Jupiter", "Saturn"] },
    { q: "What is the capital of Japan?", a: "Tokyo", options: ["Tokyo", "Seoul", "Beijing", "Bangkok"] },
    { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci", options: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Claude Monet"] },
    { q: "What is the largest ocean on Earth?", a: "Pacific Ocean", options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"] }
  ],
  IMPOSTOR: ["Pizza", "Super Mario", "iPhone", "Netflix", "TikTok", "Bitcoin", "Star Wars", "Minecraft", "Harry Potter"],
  MEME_BATTLE: [
    { id: "template-1", name: "Distracted Boyfriend", url: "https://api.memegen.link/images/distracted_boyfriend.png" },
    { id: "template-2", name: "Two Buttons", url: "https://api.memegen.link/images/2_buttons.png" },
    { id: "template-3", name: "Drake Hotline Bling", url: "https://api.memegen.link/images/drake.png" },
    { id: "template-4", name: "Woman Yelling at Cat", url: "https://api.memegen.link/images/woman-yelling-at-cat.png" }
  ],
  WOULD_YOU_RATHER: [
    "Fly like a bird or swim like a fish?",
    "Always be 10 minutes late or 20 minutes early?",
    "Lose all of your money or all of your pictures?",
    "Have a magic carpet or a transparent submarine?",
    "Live in a cave or live in a treehouse?"
  ],
  MOST_LIKELY_TO: [
    "Spend all their money on something useless?",
    "Get lost in their own neighborhood?",
    "Become a millionaire before 30?",
    "Win a reality TV show?",
    "Survive a zombie apocalypse?"
  ]
};
