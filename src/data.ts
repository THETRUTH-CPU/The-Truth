import { 
  Home, 
  Bed, 
  ChefHat, 
  Briefcase, 
  FolderLock, 
  Sparkles, 
  Trash2, 
  Wrench, 
  Baby, 
  Bath, 
  DoorClosed, 
  Package 
} from "lucide-react";

export interface RoomTypePreset {
  id: string;
  name: string;
  icon: any;
  placeholderGoal: string;
  placeholderPain: string;
}

export const ROOM_TYPES: RoomTypePreset[] = [
  {
    id: "living_room",
    name: "Living Room",
    icon: Home,
    placeholderGoal: "Create a cozy, serene lounge for guests and evening reading.",
    placeholderPain: "Magazines everywhere, cluttered coffee table, kids' toys on the floor."
  },
  {
    id: "bedroom",
    name: "Bedroom",
    icon: Bed,
    placeholderGoal: "Transform into a clean, restful sanctuary with zero visible clutter.",
    placeholderPain: "Clothes piling on the chair, unmade bed, crowded bedside table."
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: ChefHat,
    placeholderGoal: "Establish clean, unobstructed prep counters and organized spices.",
    placeholderPain: "Containers with missing lids, appliances crowding countertops."
  },
  {
    id: "office",
    name: "Home Office",
    icon: Briefcase,
    placeholderGoal: "Build a highly focused workstation with zero paper trailing.",
    placeholderPain: "Sloppy cables, boxes under desk, mounds of unfiled documents."
  },
  {
    id: "closet",
    name: "Closet / Wardrobe",
    icon: FolderLock,
    placeholderGoal: "Organize strictly by category & color, double utility shelf space.",
    placeholderPain: "Shoes scattered on floor, hangers mixed up, cannot find basic shirts."
  },
  {
    id: "playroom",
    name: "Playroom",
    icon: Baby,
    placeholderGoal: "Make a kid-friendly workspace with fast clean-up bin setups.",
    placeholderPain: "Blocks, puzzle pieces, and soft toys scattered all over the rug."
  },
  {
    id: "entryway",
    name: "Entryway & Foyer",
    icon: DoorClosed,
    placeholderGoal: "Clean catch-all station for keys, coats, and mail.",
    placeholderPain: "Mail piles, shoes scattered immediately inside the front door."
  },
  {
    id: "garage",
    name: "Garage / Workshop",
    icon: Wrench,
    placeholderGoal: "Keep workbench completely clear, stack utility tools cleanly.",
    placeholderPain: "Empty boxes from old deliveries, unsorted bolts, lawn tools block path."
  },
  {
    id: "bathroom",
    name: "Bathroom",
    icon: Bath,
    placeholderGoal: "Spas atmosphere with invisible toiletries and folded towels.",
    placeholderPain: "Expired makeup, cluster of shower bottles, crowded sink ledge."
  },
  {
    id: "other",
    name: "Other Space",
    icon: Package,
    placeholderGoal: "Create a healthy, breathable organized space.",
    placeholderPain: "Assorted miscellaneous objects without designated locations."
  }
];

export const GOAL_PRESETS = [
  "Maximize narrow shelf & surface space",
  "Adopt a minimalist, Scandinavian look",
  "Design a safe, kid-friendly floor layout",
  "Speed up the daily quick-cleaning routine",
  "Solve a low-budget organization project",
  "Hide bulky equipment & messy power cables"
];

export const PAIN_POINT_PRESETS = [
  "Flat surfaces act as catch-alls for mail & packages",
  "Cables & chargers trailing and tangled everywhere",
  "Overflowing storage boxes and lack of shelving",
  "Items don't have a designated 'resting home'",
  "Stuffed corners and bulky, blocking furniture",
  "Too many clothing items or accessories without space"
];

export const MOCK_LOADING_TIPS = [
  "Gemini is identifying objects in your room photo...",
  "Calculating space density & clutter metrics...",
  "Designing structural boundaries to separate activity zones...",
  "Curating specific storage bin solutions & aesthetics...",
  "Fusing styling theory with practical step-by-step progress checklists...",
  "Almost ready! Wrapping up your tailored decluttering plan..."
];

export const SAMPLE_ROOMS = [
  {
    id: "sample-1",
    roomName: "Modern Living Room",
    imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600",
    afterImageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600",
    goals: "Maximize clear floor flow and style with plants",
    painPoints: "Piles of papers on side tables, nested toys, bulky storage",
    analysis: {
      roomType: "living_room",
      roomTypeDisplay: "Cozy Living Room",
      clutterScore: 3,
      roomAnalysis: "This living room exhibits a very clean base outline with excellent natural lighting. The general design succeeds by placing seating blocks elegantly, but minor clutter around side tables and pillows detracts from the minimalism. Resolving flat-surface containment will elevate the tranquility of the room.",
      clutterSources: [
        "Unsorted papers and notebooks on the side stand",
        "Excess couch cushions looking overstuffed",
        "Exposed black power cables running to the reading lamp"
      ],
      declutterSteps: [
        {
          id: "s1",
          phase: "Phase 1: Clear",
          title: "The Side Stand Cleanse",
          description: "Relocate magazines and papers to a hidden folder or file drawer. Keep only your current active book and a fresh coaster on the side stand."
        },
        {
          id: "s2",
          phase: "Phase 2: Cushion Ratio",
          title: "Reduce Pillow Bulk",
          description: "Reduce the number of couch cushions to maximum 2 or 3. Store others or donate if they are rarely used."
        },
        {
          id: "s3",
          phase: "Phase 3: Cord Stealth",
          title: "Conceal the Lighting Cord",
          description: "Align the black power cord along the leg of the side-stand using Velcro zip ties or a slim translucent cable clip."
        }
      ],
      layoutSuggestions: [
        {
          area: "Side Table Area",
          suggestion: "Pull the small side-table 4 inches away from the sofa to allow space to flow naturally and display geometric breathing room."
        }
      ],
      storageSolutions: [
        {
          item: "Woven rattan organizer basket",
          purpose: "Place next to the sofa to sweep up loose pillows and reading materials under 10 seconds.",
          estimatedCost: "Low"
        }
      ],
      aestheticTips: [
        "Group decorative pieces in uneven quantities (such as 3 accent items) to trigger a dynamic asymmetrical layout.",
        "Add a small green accent leaf in a glass vase to tie back to the natural tones."
      ]
    }
  },
  {
    id: "sample-2",
    roomName: "Compact Home Office",
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600",
    afterImageUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&q=80&w=600",
    goals: "Keep desk clear for focused daily operations",
    painPoints: "Wires under desk, piles of post-its, charging cords",
    analysis: {
      roomType: "office",
      roomTypeDisplay: "Structured Workspace",
      clutterScore: 5,
      roomAnalysis: "The office space enjoys a productive design, though visual noise around the workspace acts as an operational distraction. tangled hardware accessories and unfiled notes are creating subconscious stress during work hours.",
      clutterSources: [
        "Multiple stray charging cords spreading across the solid wood desktop",
        "A cluster of loose post-it reminders stuck directly to the monitor border",
        "Power strips dangling clumsily in the ankle zone"
      ],
      declutterSteps: [
        {
          id: "s1",
          phase: "Phase 1: Clear Desk",
          title: "The Inbox Strategy",
          description: "Take all papers, receipts, and notes off the desk. Dedicate ONE paper tray as an incoming triage location. File or recycle everything else immediately."
        },
        {
          id: "s2",
          phase: "Phase 2: Cable Management",
          title: "Under-desk Harnessing",
          description: "Mount the power strip directly to the underside of the desk using heavy-duty command strips or an under-desk wire basket."
        },
        {
          id: "s3",
          phase: "Phase 3: Digital Transition",
          title: "Consolidate Tangled Post-its",
          description: "Move stray physical post-its into a dedicated digital markdown pad or an elegant magnetic desktop whiteboard."
        }
      ],
      layoutSuggestions: [
        {
          area: "Monitor & Desk Position",
          suggestion: "Center the monitor at eye-height. Slide stationery to the non-dominant side drawer to maximize the clean focus vector in front of you."
        }
      ],
      storageSolutions: [
        {
          item: "Under-desk wire cable tray",
          purpose: "Suspends power cubes, adapter boxes, and lengthy cords safely off the floor.",
          estimatedCost: "Medium"
        },
        {
          item: "Horizontal leather desk pad",
          purpose: "Defines a clean keyboard/mouse tactile surface boundary, naturally resisting clutter spillover.",
          estimatedCost: "Medium"
        }
      ],
      aestheticTips: [
        "Deploy single warm-toned bias backlighting behind the monitor to soften desk edge shadows and support vision safety.",
        "Stick to a dual-color desk palette (e.g. walnut wood and forest green) to create professional unity."
      ]
    }
  }
];
