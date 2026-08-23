import type { CaseFile } from "../domain/model";
import type { PromptContentPort } from "./ports";

export const caseFiles: CaseFile[] = [
  {
    id: "flamingo-collective",
    category: "Animal files",
    prompt: "A group of flamingos is called a ____.",
    truth: "flamboyance",
    explanation: "The Smithsonian lists “flamboyance” among the collective nouns for flamingos.",
    decoys: ["flare", "parade", "blush"],
    sourceLabel: "Smithsonian’s National Zoo",
    sourceUrl: "https://nationalzoo.si.edu/animals/news/why-are-flamingos-pink-and-other-flamingo-facts"
  },
  {
    id: "oregon-flag",
    category: "Official oddities",
    prompt: "The reverse side of Oregon’s state flag shows a ____.",
    truth: "beaver",
    explanation: "Oregon’s flag has different designs on each side; the reverse depicts a beaver.",
    decoys: ["covered wagon", "salmon", "Douglas fir"],
    sourceLabel: "Oregon Secretary of State",
    sourceUrl: "https://sos.oregon.gov/blue-book/explore/pages/almanac-d-h.aspx"
  },
  {
    id: "first-webcam",
    category: "Early internet",
    prompt: "The first webcam watched a shared ____ at Cambridge University.",
    truth: "coffee pot",
    explanation: "Researchers created the camera feed so they could avoid wasted trips to an empty coffee pot.",
    decoys: ["printer tray", "sandwich cart", "bicycle rack"],
    sourceLabel: "University of Cambridge Computer Laboratory",
    sourceUrl: "https://www.cl.cam.ac.uk/coffee/qsf/timeline.html"
  },
  {
    id: "wombat-cubes",
    category: "Animal files",
    prompt: "Wombats are famous for producing droppings shaped like ____.",
    truth: "cubes",
    explanation: "Researchers found that uneven elasticity in the wombat intestine forms the distinctive cubes.",
    decoys: ["tiny spirals", "pyramids", "flat coins"],
    sourceLabel: "Smithsonian Institution",
    sourceUrl: "https://collections.si.edu/search/detail/edanmdm%3Aposts_978462987c4f6cbfab1d24fb14994465"
  },
  {
    id: "octopus-hearts",
    category: "Undersea records",
    prompt: "An octopus has ____ hearts.",
    truth: "three",
    explanation: "Two hearts pump blood through the gills; the third circulates oxygenated blood through the body.",
    decoys: ["two", "five", "eight"],
    sourceLabel: "NOAA Ocean Exploration",
    sourceUrl: "https://oceanexplorer.noaa.gov/news/exploration-extras/22valentines/media/octopus.pdf"
  },
  {
    id: "hagfish-hearts",
    category: "Undersea records",
    prompt: "The humble hagfish has ____ hearts.",
    truth: "four",
    explanation: "NOAA notes that hagfish top the heart count with four.",
    decoys: ["two", "six", "nine"],
    sourceLabel: "NOAA Ocean Service",
    sourceUrl: "https://oceanservice.noaa.gov/news/feb26/undersea-creatures-valentines-day.html"
  },
  {
    id: "scotland-unicorn",
    category: "Official oddities",
    prompt: "Scotland’s national animal is the ____.",
    truth: "unicorn",
    explanation: "The mythical unicorn has served as a Scottish royal and national symbol for centuries.",
    decoys: ["Highland cow", "golden eagle", "kelpie"],
    sourceLabel: "Scotland.org",
    sourceUrl: "https://www.scotland.org/inspiration/what-is-the-national-animal-of-scotland"
  },
  {
    id: "mail-coconut",
    category: "Postal files",
    prompt: "USPS says you can mail a coconut without a ____.",
    truth: "box",
    explanation: "A destination and return address can be written directly on the coconut before postage is added.",
    decoys: ["ZIP Code", "return address", "customs form"],
    sourceLabel: "U.S. Postal Service",
    sourceUrl: "https://facts.usps.com/fun/"
  },
  {
    id: "hope-diamond-mail",
    category: "Postal files",
    prompt: "The Hope Diamond reached the Smithsonian by ____.",
    truth: "Registered Mail",
    explanation: "Harry Winston mailed the diamond in a brown-paper-wrapped box in 1958.",
    decoys: ["armored train", "diplomatic pouch", "police motorcycle"],
    sourceLabel: "U.S. Postal Service",
    sourceUrl: "https://facts.usps.com/fun/"
  },
  {
    id: "baby-post",
    category: "Postal files",
    prompt: "In 1913, a few parents briefly used Parcel Post to mail their ____.",
    truth: "children",
    explanation: "USPS records that an eight-month-old baby was safely delivered to a nearby grandmother before regulations stopped the practice.",
    decoys: ["farm animals", "wedding cakes", "houseplants"],
    sourceLabel: "U.S. Postal Service",
    sourceUrl: "https://facts.usps.com/fun/"
  },
  {
    id: "apollo-ten-names",
    category: "Space files",
    prompt: "Apollo 10 named its lunar module after ____.",
    truth: "Snoopy",
    explanation: "The command module was Charlie Brown, and the lunar module was Snoopy.",
    decoys: ["Woodstock", "the Road Runner", "Yogi Bear"],
    sourceLabel: "NASA",
    sourceUrl: "https://www.nasa.gov/wp-content/uploads/2024/10/apollo-12-comic-book-print-res.pdf"
  },
  {
    id: "moon-golf",
    category: "Space files",
    prompt: "The astronaut who hit golf balls on the Moon was ____.",
    truth: "Alan Shepard",
    explanation: "Shepard attached a six-iron head to a sample-tool handle during Apollo 14.",
    decoys: ["Buzz Aldrin", "Pete Conrad", "John Young"],
    sourceLabel: "NASA",
    sourceUrl: "https://www.nasa.gov/history/apollo-14-demonstrated-spaceflight-challenges-are-solvable/"
  },
  {
    id: "space-smell",
    category: "Space files",
    prompt: "Astronaut Alexander Gerst compared the smell of space to walnuts and motorcycle ____.",
    truth: "brake pads",
    explanation: "The odor clinging to space suits has also been compared with ozone, gunpowder, and seared steak.",
    decoys: ["engine oil", "tires", "seat leather"],
    sourceLabel: "NASA Ames Research Center",
    sourceUrl: "https://www.nasa.gov/space-science-and-astrobiology-at-ames/interesting-fact-of-the-month-current/interesting-fact-of-the-month-2021/"
  },
  {
    id: "yellowstone-wyoming",
    category: "Map room",
    prompt: "About ____ percent of Yellowstone National Park lies in Wyoming.",
    truth: "96",
    explanation: "The remaining land is approximately three percent in Montana and one percent in Idaho.",
    decoys: ["72", "83", "99"],
    sourceLabel: "U.S. National Park Service",
    sourceUrl: "https://www.nps.gov/yell/planyourvisit/parkfacts.htm"
  },
  {
    id: "america-map",
    category: "Archive files",
    prompt: "The first document known to use the name “America” was a ____.",
    truth: "world map",
    explanation: "Martin Waldseemüller’s 1507 world map is nicknamed “America’s Birth Certificate.”",
    decoys: ["ship manifest", "royal letter", "school atlas"],
    sourceLabel: "Library of Congress",
    sourceUrl: "https://www.loc.gov/about/fascinating-facts"
  },
  {
    id: "floating-post-office",
    category: "Postal files",
    prompt: "The Post Office in Halibut Cove, Alaska, is located on a ____.",
    truth: "houseboat",
    explanation: "The floating Post Office is permanently tied to a dock in Homer, Alaska.",
    decoys: ["seaplane", "ferry", "barge crane"],
    sourceLabel: "U.S. Postal Service",
    sourceUrl: "https://facts.usps.com/fun/"
  }
];

export const bureauContent: PromptContentPort = {
  forRound(roundNumber, sessionId) {
    let state = 2_166_136_261;
    for (const character of sessionId) {
      state ^= character.codePointAt(0) ?? 0;
      state = Math.imul(state, 16_777_619) >>> 0;
    }
    const deck = caseFiles.map((_, index) => index);
    for (let index = deck.length - 1; index > 0; index -= 1) {
      state = (state * 1_664_525 + 1_013_904_223) >>> 0;
      const swapIndex = Math.floor((state / 0x1_0000_0000) * (index + 1));
      [deck[index], deck[swapIndex]] = [deck[swapIndex]!, deck[index]!];
    }
    const index = deck[(roundNumber - 1) % deck.length]!;
    return structuredClone(caseFiles[index]!);
  }
};
