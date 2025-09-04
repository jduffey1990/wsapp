// ui/src/utils/bracketStruc.js
export const bracketNames = {
  "2025": {
    // EAST (e1–e16)
    e1: "Duke",
    e2: "Alabama",
    e3: "Wisconsin",
    e4: "Arizona",
    e5: "Oregon",
    e6: "BYU",
    e7: "St. Mary's",
    e8: "Mississippi St.",
    e9: "Baylor",
    e10: "Vanderbilt",
    e11: "VCU",
    e12: "Liberty",
    e13: "Akron",
    e14: "Montana",
    e15: "Robert Morris",
    e16: "Mt. St. Mary's",
    
    // MIDWEST (m1–m16)
    m1: "Houston",
    m2: "Tennessee",
    m3: "Kentucky",
    m4: "Purdue",
    m5: "Clemson",
    m6: "Illinois",
    m7: "UCLA",
    m8: "Gonzaga",
    m9: "Georgia",
    m10: "Utah St.",
    m11: "Xavier",
    m12: "McNeese",
    m13: "High Point",
    m14: "Troy",
    m15: "Wofford",
    m16: "SIUE",
    
    // SOUTH (s1–s16)
    s1: "Auburn",
    s2: "Michigan St.",
    s3: "Iowa St.",
    s4: "Texas A&M",
    s5: "Michigan",
    s6: "Ole Miss",
    s7: "Marquette",
    s8: "Louisville",
    s9: "Creighton",
    s10: "New Mexico",
    s11: "UNC",
    s12: "UCSD",
    s13: "Yale",
    s14: "Lipscomb",
    s15: "Bryant",
    s16: "Alabama St.",

    // WEST (w1–w16)
    w1: "Florida",
    w2: "St. John's",
    w3: "Texas Tech",
    w4: "Maryland",
    w5: "Memphis",
    w6: "Missouri",
    w7: "Kansas",
    w8: "UConn",
    w9: "Oklahoma",
    w10: "Arkansas",
    w11: "Drake",
    w12: "Colorado St.",
    w13: "Grand Canyon",
    w14: "UNCW",
    w15: "Omaha",
    w16: "Norfolk St.",
  },
  "base": {
    // EAST (e1–e16)
    e1: "East 1 Seed",
    e2: "East 2 Seed",
    e3: "East 3 Seed",
    e4: "East 4 Seed",
    e5: "East 5 Seed",
    e6: "East 6 Seed",
    e7: "East 7 Seed",
    e8: "East 8 Seed",
    e9: "East 9 Seed",
    e10: "East 10 Seed",
    e11: "East 11 Seed",
    e12: "East 12 Seed",
    e13: "East 13 Seed",
    e14: "East 14 Seed",
    e15: "East 15 Seed",
    e16: "East 16 Seed",
    
    // WEST (w1–w16)
    w1: "West 1 Seed",
    w2: "West 2 Seed",
    w3: "West 3 Seed",
    w4: "West 4 Seed",
    w5: "West 5 Seed",
    w6: "West 6 Seed",
    w7: "West 7 Seed",
    w8: "West 8 Seed",
    w9: "West 9 Seed",
    w10: "West 10 Seed",
    w11: "West 11 Seed",
    w12: "West 12 Seed",
    w13: "West 13 Seed",
    w14: "West 14 Seed",
    w15: "West 15 Seed",
    w16: "West 16 Seed",
    
    // MIDWEST (m1–m16)
    m1: "Midwest 1 Seed",
    m2: "Midwest 2 Seed",
    m3: "Midwest 3 Seed",
    m4: "Midwest 4 Seed",
    m5: "Midwest 5 Seed",
    m6: "Midwest 6 Seed",
    m7: "Midwest 7 Seed",
    m8: "Midwest 8 Seed",
    m9: "Midwest 9 Seed",
    m10: "Midwest 10 Seed",
    m11: "Midwest 11 Seed",
    m12: "Midwest 12 Seed",
    m13: "Midwest 13 Seed",
    m14: "Midwest 14 Seed",
    m15: "Midwest 15 Seed",
    m16: "Midwest 16 Seed",
    
    // SOUTH (s1–s16)
    s1: "South 1 Seed",
    s2: "South 2 Seed",
    s3: "South 3 Seed",
    s4: "South 4 Seed",
    s5: "South 5 Seed",
    s6: "South 6 Seed",
    s7: "South 7 Seed",
    s8: "South 8 Seed",
    s9: "South 9 Seed",
    s10: "South 10 Seed",
    s11: "South 11 Seed",
    s12: "South 12 Seed",
    s13: "South 13 Seed",
    s14: "South 14 Seed",
    s15: "South 15 Seed",
    s16: "South 16 Seed",
  }
};

  export const bracketFinalYears = {
    "base": ["e1", "e8", "e5", "e4", "e6", "e3", "e7", "e2", "e1", "e4", "e6", "e2", "e1", "e2", "m1", "m8", "m5", "m4", "m6", "m3", "m7", "m2", "m1", "m4", "m3", "m2", "m1", "m2", "s1", "s8", "s5", "s4", "s6", "s3", "s7", "s2", "s1", "s4", "s6", "s2", "s1", "s2", "w1", "w8", "w5", "w4", "w6", "w3", "w7", "w2", "w1", "w4", "w3", "w2", "w1", "w2", "e1", "m1", "s1", "w1", "e1", "s1", "e1"],

    "2025": ["e1", "e9", "e5", "e4", "e6", "e3", "e7", "e2", "e1", "e4", "e6", "e2", "e1", "e2", "m1", "m8", "m12", "m4", "m6", "m3", "m7", "m2", "m1", "m4", "m3", "m2", "m1", "m2", "s1", "s9", "s5", "s4", "s6", "s3", "s10", "s2", "s1", "s5", "s6", "s2", "s1", "s2", "w1", "w8", "w12", "w4", "w11", "w3", "w10", "w2", "w1", "w4", "w3", "w10", "w1", "w3", "e1", "m1", "s1", "w1", "e1", "w1", "w1"]
    };

  export const recordsOver20 = {
    //real odds
    "1vs16": "154-2",
    "8vs9": "75-81",
    "5vs12": "101-55",
    "4vs13": "123-33",
    "6vs11": "95-61",
    "3vs14": "133-23",
    "7vs10": "95-61",
    "2vs15": "145-11",
    "1vs8": "61-17",
    "4vs5": "47-36",
    "3vs6": "48-31",
    "2vs7": "63-27",
    "1vs4": "49-20",
    "2vs3": "37-24",
    "1vs2": "38-30",
    "1vs9": "74-6",
    "3vs11": "36-20",
    "1vs5": "43-11",
    "2vs11": "16-4",
    "5vs13": "18-3",
    "4vs12": "30-13",
    "1vs12": "20-0",
    "1vs3": "23-14",
    "2vs10": "36-19",
    "2vs6": "24-8",
    //even odds mocked
    "1vs1": "10-10",
    "2vs2": "10-10",
    "3vs3": "10-10",
    "4vs4": "10-10",
    "5vs5": "10-10",
    "6vs6": "10-10",
    "7vs7": "10-10",
    "8vs8": "10-10",
    "9vs9": "10-10",
    "10vs10": "10-10",
    "11vs11": "10-10",
    "12vs12": "10-10",
    "13vs13": "10-10",
    "14vs14": "10-10",
    "15vs15": "10-10",
    "16vs16": "10-10",
  };

  export const fixRecords = (obj) => {
    const records = new Map();
  
    for (const key in obj) {
      const [winsStr, lossesStr] = obj[key].split("-");
      const wins = parseFloat(winsStr);
      const losses = parseFloat(lossesStr);
      const total = wins + losses;
  
      // If there's no data or total is zero, skip or set to 0
      if (!total) {
        continue; // or records.set(key, 0) if you'd prefer
      }
  
      // Convert to an integer percentage
      const percentage = Math.round((wins / total) * 100);
  
      records.set(key, percentage);
    }
  
    return records;
  };
  
  