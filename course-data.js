window.COURSE_DATA = {
  meta: {
    title: "SEPTEMBER ENGLISH: LEVEL UP",
    subtitle: "18 lessons. Real English. Real skills.",
    level: "A2+ → B1",
    duration: "18 × 60 min",
    version: 1
  },
  episodes: [
    { id: 1, title: "WHO ARE YOU ONLINE?", theme: "identity · profiles · real life", status: "current", color: "blue" },
    { id: 2, title: "FRIENDS: SAME OR DIFFERENT?", theme: "friendship · teamwork · comparison", status: "ready", color: "pink" },
    { id: 3, title: "THE DAY EVERYTHING WENT WRONG", theme: "stories · accidents · timelines", status: "ready", color: "yellow" },
    { id: 4, title: "CAN YOU LIVE WITHOUT YOUR PHONE?", theme: "phones · habits · balance", status: "ready", color: "blue" },
    { id: 5, title: "WHAT SHOULD I DO?", theme: "teen problems · advice · boundaries", status: "ready", color: "pink" },
    { id: 6, title: "CHECKPOINT 1: THE SCHOOL SURVIVAL GUIDE", theme: "checkpoint · school · practical English", status: "checkpoint", color: "yellow" },
    { id: 7, title: "HAVE YOU EVER TRIED IT?", theme: "experiences · challenge · follow-up", status: "ready", color: "blue" },
    { id: 8, title: "WORTH THE MONEY?", theme: "money · shopping · value", status: "ready", color: "pink" },
    { id: 9, title: "WHAT ARE WE DOING THIS WEEKEND?", theme: "plans · arrangements · prediction", status: "ready", color: "yellow" },
    { id: 10, title: "FOOD THAT MAKES SENSE", theme: "food · requirements · choices", status: "ready", color: "blue" },
    { id: 11, title: "GAME, FILM OR SERIES?", theme: "media · reviews · opinions", status: "ready", color: "pink" },
    { id: 12, title: "CHECKPOINT 2: PLAN THE PERFECT POP-UP", theme: "checkpoint · budget · event", status: "checkpoint", color: "yellow" },
    { id: 13, title: "IF THIS HAPPENS…", theme: "risk · weather · Plan B", status: "ready", color: "blue" },
    { id: 14, title: "IF YOU COULD CHANGE ONE THING…", theme: "school · ideas · imagination", status: "ready", color: "pink" },
    { id: 15, title: "MADE, SHARED, REMIXED", theme: "AI · media · sources", status: "ready", color: "yellow" },
    { id: 16, title: "THE CITY CHALLENGE", theme: "city · route · practical information", status: "ready", color: "blue" },
    { id: 17, title: "YOUR FUTURE, NOT A JOB TITLE", theme: "skills · future · possibility", status: "ready", color: "pink" },
    { id: 18, title: "FINAL MISSION: LEVEL UP LIVE", theme: "final checkpoint · integrated B1", status: "checkpoint", color: "yellow" }
  ],
  episode01: {
    objective: "Describe yourself and explain how your online life differs from real life.",
    canDo: [
      "talk about habits and what is happening now",
      "ask natural personal questions",
      "use I’m into… to talk about interests",
      "handle a short OGE-style interview"
    ],
    audio: {
      duration: 28,
      transcript: "Hey, I’m Maya. My profile is mostly about music because I usually post short guitar covers. But this week is different. I’m working on a science presentation with two classmates, so right now I’m making slides and trying to make them look less boring. My profile makes me look very confident. In real life, I still get nervous before presentations. I don’t post that part.",
      gist: "Her profile shows music, but this week she is preparing a science presentation.",
      details: [
        { statement: "Maya usually posts guitar covers.", answer: true },
        { statement: "She is working alone this week.", answer: false },
        { statement: "She always feels confident before presentations.", answer: false }
      ]
    },
    sort: [
      { id: "s1", text: "Maya usually posts guitar covers.", target: "usual" },
      { id: "s2", text: "She’s making slides right now.", target: "now" },
      { id: "s3", text: "I check my messages after school.", target: "usual" },
      { id: "s4", text: "We’re working on a group project this week.", target: "temporary" },
      { id: "s5", text: "Jordan plays basketball on Fridays.", target: "usual" },
      { id: "s6", text: "I’m using my laptop at the moment.", target: "now" }
    ],
    sentence: {
      words: ["you", "usually", "do", "post", "what"],
      answer: "what do you usually post"
    },
    typing: [
      {
        id: "type1",
        prompt: "Maya usually ___ (post) guitar covers.",
        answers: ["posts"],
        hints: ["Look at the time marker: usually.", "The subject is Maya. Add the third-person ending."],
        explanation: "We use Present Simple for a regular habit. With he/she/it, the verb takes -s."
      },
      {
        id: "type2",
        prompt: "This week, she ___ (work) on a science presentation.",
        answers: ["is working", "she is working"],
        hints: ["This is temporary, not her usual routine.", "Use be + verb-ing. The subject is she."],
        explanation: "This week signals a temporary situation, so we use Present Continuous: is working."
      }
    ],
    vocab: [
      { id: "v1", word: "be into", pronunciation: "/biː ˈɪntuː/", meaning: "to be interested in something", example: "I’m really into street photography.", ru: "увлекаться; интересоваться" },
      { id: "v2", word: "in real life", pronunciation: "/ɪn ˌrɪəl ˈlaɪf/", meaning: "outside the internet or a fictional situation", example: "He seems quiet online, but he’s funny in real life.", ru: "в реальной жизни" },
      { id: "v3", word: "post", pronunciation: "/pəʊst/", meaning: "to publish something online", example: "She usually posts a new video on Friday.", ru: "публиковать" },
      { id: "v4", word: "scroll", pronunciation: "/skrəʊl/", meaning: "to move through content on a screen", example: "I stopped scrolling and replied to the message.", ru: "листать экран" },
      { id: "v5", word: "share", pronunciation: "/ʃeə/", meaning: "to let other people see online content", example: "I don’t share personal photos publicly.", ru: "делиться; публиковать для других" },
      { id: "v6", word: "at the moment", pronunciation: "/ət ðə ˈməʊmənt/", meaning: "now or around now", example: "I’m reading a graphic novel at the moment.", ru: "в данный момент; сейчас" },
      { id: "v7", word: "go live", pronunciation: "/ɡəʊ ˈlaɪv/", meaning: "to start broadcasting live online", example: "The school podcast is going live at six.", ru: "выйти в прямой эфир" },
      { id: "v8", word: "come across as", pronunciation: "/kʌm əˈkrɒs æz/", meaning: "to seem to other people", example: "That short reply may come across as unfriendly.", ru: "производить впечатление" }
    ],
    ogeQuestions: [
      "How often do you use social media?",
      "What do you usually do online?",
      "What are you working on at school at the moment?",
      "What kind of content do you enjoy watching?",
      "Do you think online profiles show real life? Why?",
      "What would you like to change about your online habits?"
    ]
  }
};
