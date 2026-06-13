import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/shared/utils/password.js";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { LABEL_COLORS } from "../src/shared/constants/index.js";
import type { CardRecurring, DueDateReminder } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const DAY_MS = 24 * 60 * 60 * 1000;

const users = [
  {
    name: "Swaroop",
    email: "swaroopch1234@gmail.com",
    password: "password123",
  },
  { name: "John", email: "john@example.com", password: "password123" },
  { name: "Alice", email: "alice@example.com", password: "password123" },
  {
    name: "Demo User",
    email: "demo@example.com",
    password: "password123",
  },
];

const listTitles = ["Backlog", "To Do", "In Progress", "Review", "Done"];

const labelDefinitions = [
  { name: "Bug", color: LABEL_COLORS[3]! },
  { name: "Feature", color: LABEL_COLORS[0]! },
  { name: "Design", color: LABEL_COLORS[4]! },
  { name: "High Priority", color: LABEL_COLORS[2]! },
  { name: "Documentation", color: LABEL_COLORS[6]! },
  { name: "Blocked", color: LABEL_COLORS[1]! },
];

type ChecklistSeed = {
  title: string;
  items: {
    title: string;
    isCompleted: boolean;
    assigneeIndex?: number;
  }[];
};

type CardSeed = {
  listIndex: number;
  title: string;
  description: string;
  labelIndexes: number[];
  memberIndexes: number[];
  startDateOffsetDays?: number;
  dueDateOffsetDays?: number;
  dueTime?: string;
  dueComplete?: boolean;
  recurring?: CardRecurring;
  dueDateReminder?: DueDateReminder;
  coverColor?: string;
  archived?: boolean;
  checklists?: ChecklistSeed[];
  comments?: { userIndex: number; content: string }[];
  attachments?: { kind: "LINK"; url: string; filename: string }[];
};

const cardDefinitions: CardSeed[] = [
  // Backlog (3 cards — 1 archived)
  {
    listIndex: 0,
    title: "Research competitor onboarding flows",
    description:
      "Review how Notion, Asana, and Linear handle first-time user onboarding. Document patterns we should adopt or avoid.",
    labelIndexes: [1, 4],
    memberIndexes: [3, 2],
    startDateOffsetDays: -14,
    dueDateOffsetDays: 21,
    dueDateReminder: "ONE_DAY",
    checklists: [
      {
        title: "Research checklist",
        items: [
          { title: "Collect 5 competitor screenshots", isCompleted: true, assigneeIndex: 3 },
          { title: "Write comparison doc", isCompleted: false, assigneeIndex: 2 },
          { title: "Share findings in standup", isCompleted: false },
        ],
      },
    ],
    comments: [
      { userIndex: 3, content: "Focus on mobile flows first — that's our gap." },
    ],
    attachments: [
      {
        kind: "LINK",
        url: "https://www.notion.so/product",
        filename: "Notion onboarding reference",
      },
    ],
  },
  {
    listIndex: 0,
    title: "Spike: real-time board updates",
    description:
      "Evaluate WebSockets vs SSE for live card moves. Prototype with a single board and measure latency under 10 concurrent users.",
    labelIndexes: [1],
    memberIndexes: [0],
    dueDateOffsetDays: 30,
    recurring: "NEVER",
    checklists: [
      {
        title: "Spike tasks",
        items: [
          { title: "Draft architecture note", isCompleted: false, assigneeIndex: 0 },
          { title: "Build 2-hour prototype", isCompleted: false },
          { title: "Present recommendation", isCompleted: false },
        ],
      },
    ],
  },
  {
    listIndex: 0,
    title: "Legacy API deprecation plan",
    description: "Define timeline and migration path for v1 endpoints. Coordinate with mobile team before announcing.",
    labelIndexes: [4, 5],
    memberIndexes: [1],
    archived: true,
    dueDateOffsetDays: -7,
    dueComplete: true,
    comments: [
      { userIndex: 1, content: "Archived — moved to Q3 roadmap." },
    ],
  },

  // To Do (3 cards — 1 archived)
  {
    listIndex: 1,
    title: "Implement board activity feed",
    description:
      "Surface list/card/comment events on the board menu. Paginate results and link each entry back to the relevant card.",
    labelIndexes: [1, 3],
    memberIndexes: [0, 1],
    startDateOffsetDays: 0,
    dueDateOffsetDays: 5,
    dueTime: "17:00",
    dueDateReminder: "ONE_HOUR",
    coverColor: "#0079bf",
    checklists: [
      {
        title: "Implementation",
        items: [
          { title: "Activity repository queries", isCompleted: true, assigneeIndex: 0 },
          { title: "Board activity panel UI", isCompleted: false, assigneeIndex: 1 },
          { title: "Card-level activity tab", isCompleted: false },
        ],
      },
      {
        title: "QA",
        items: [
          { title: "Verify pagination", isCompleted: false },
          { title: "Test empty state", isCompleted: false },
        ],
      },
    ],
    comments: [
      { userIndex: 0, content: "Reuse the card activity component where possible." },
      { userIndex: 1, content: "I'll pick up the panel UI today." },
    ],
    attachments: [
      {
        kind: "LINK",
        url: "https://github.com/example/trello-clone/pull/42",
        filename: "PR #42 — activity API",
      },
    ],
  },
  {
    listIndex: 1,
    title: "Add archived cards panel",
    description:
      "Allow users to browse archived cards from the board menu, search by title, and restore or open in read-only modal.",
    labelIndexes: [1],
    memberIndexes: [3],
    dueDateOffsetDays: 8,
    checklists: [
      {
        title: "Deliverables",
        items: [
          { title: "List archived cards endpoint", isCompleted: false, assigneeIndex: 3 },
          { title: "Restore card mutation", isCompleted: false },
          { title: "Archived items UI panel", isCompleted: false },
        ],
      },
    ],
  },
  {
    listIndex: 1,
    title: "Fix drag placeholder flicker on mobile",
    description: "Card drop placeholder jumps when scrolling horizontally on narrow viewports. Reproduce on iOS Safari.",
    labelIndexes: [0, 3],
    memberIndexes: [2],
    archived: true,
    dueDateOffsetDays: -2,
    comments: [{ userIndex: 2, content: "Could not reproduce on latest build — archiving for now." }],
  },

  // In Progress (3 cards — 1 archived)
  {
    listIndex: 2,
    title: "Card modal — dates & reminders",
    description:
      "Support start date, due date, due time, recurring schedule, and reminder offsets. Persist all fields via PATCH /cards/:id.",
    labelIndexes: [1, 2],
    memberIndexes: [0, 3],
    startDateOffsetDays: -3,
    dueDateOffsetDays: 2,
    dueTime: "09:30",
    recurring: "WEEKLY",
    dueDateReminder: "FIFTEEN_MINUTES",
    coverColor: "#61bd4f",
    checklists: [
      {
        title: "Backend",
        items: [
          { title: "Extend card validator", isCompleted: true, assigneeIndex: 0 },
          { title: "Migration for reminder enum", isCompleted: true, assigneeIndex: 0 },
          { title: "Activity on date change", isCompleted: false },
        ],
      },
      {
        title: "Frontend",
        items: [
          { title: "Dates panel UI", isCompleted: true, assigneeIndex: 3 },
          { title: "Badge on card preview", isCompleted: false, assigneeIndex: 3 },
          { title: "Timezone edge cases", isCompleted: false },
        ],
      },
    ],
    comments: [
      { userIndex: 3, content: "Dates panel matches Trello layout — ready for review." },
    ],
  },
  {
    listIndex: 2,
    title: "Checklist item assignees",
    description: "Allow assigning board members to individual checklist items with avatar chips in the card modal.",
    labelIndexes: [1],
    memberIndexes: [1, 2],
    dueDateOffsetDays: 4,
    checklists: [
      {
        title: "Tasks",
        items: [
          { title: "Schema already supports assignedToId", isCompleted: true, assigneeIndex: 1 },
          { title: "Members dropdown on item row", isCompleted: false, assigneeIndex: 2 },
          { title: "Seed data with assignees", isCompleted: false, assigneeIndex: 1 },
        ],
      },
    ],
    attachments: [
      {
        kind: "LINK",
        url: "https://www.figma.com/file/example/checklist-assignees",
        filename: "Figma — checklist assignees",
      },
    ],
  },
  {
    listIndex: 2,
    title: "Experiment: board background images",
    description: "Prototype uploading a background image to Supabase and applying it on the board canvas.",
    labelIndexes: [2],
    memberIndexes: [2],
    archived: true,
    startDateOffsetDays: -10,
    dueDateOffsetDays: -5,
    comments: [{ userIndex: 2, content: "Paused — solid colors are enough for MVP." }],
  },

  // Review (3 cards)
  {
    listIndex: 3,
    title: "JWT refresh token rotation",
    description:
      "Verify refresh flow under concurrent tab usage. Ensure old refresh tokens are invalidated after rotation.",
    labelIndexes: [4],
    memberIndexes: [0],
    dueDateOffsetDays: 1,
    dueDateReminder: "AT_DUE_DATE",
    checklists: [
      {
        title: "Review checklist",
        items: [
          { title: "Code review complete", isCompleted: true, assigneeIndex: 0 },
          { title: "Manual test logout/login", isCompleted: true, assigneeIndex: 1 },
          { title: "Security sign-off", isCompleted: false },
        ],
      },
    ],
    comments: [
      { userIndex: 1, content: "Tested in Chrome + Firefox — looks good." },
      { userIndex: 0, content: "Waiting on security review before merge." },
    ],
  },
  {
    listIndex: 3,
    title: "List copy & move actions",
    description: "Copy list duplicates cards; move list reorders within or across boards. Confirm position math in transactions.",
    labelIndexes: [1],
    memberIndexes: [1, 3],
    startDateOffsetDays: -1,
    dueDateOffsetDays: 3,
    coverColor: "#ff9f1a",
    checklists: [
      {
        title: "Sign-off",
        items: [
          { title: "Copy list e2e test", isCompleted: true, assigneeIndex: 3 },
          { title: "Move list cross-board", isCompleted: true, assigneeIndex: 1 },
          { title: "Update README", isCompleted: false },
        ],
      },
    ],
  },
  {
    listIndex: 3,
    title: "Label create & edit flows",
    description: "Board-level labels with color picker. Assign/remove from card modal with optimistic cache updates.",
    labelIndexes: [2, 1],
    memberIndexes: [3],
    dueDateOffsetDays: 2,
    comments: [{ userIndex: 3, content: "Color palette matches Trello defaults." }],
  },

  // Done (3 cards)
  {
    listIndex: 4,
    title: "User authentication (login/logout)",
    description:
      "Email/password login with bcrypt hashing, JWT access + refresh tokens, and HTTP-only cookies. Protected API routes.",
    labelIndexes: [1],
    memberIndexes: [0],
    startDateOffsetDays: -30,
    dueDateOffsetDays: -20,
    dueComplete: true,
    checklists: [
      {
        title: "Shipped",
        items: [
          { title: "Login endpoint", isCompleted: true, assigneeIndex: 0 },
          { title: "Refresh interceptor", isCompleted: true, assigneeIndex: 0 },
          { title: "Route guards", isCompleted: true, assigneeIndex: 1 },
        ],
      },
    ],
    comments: [{ userIndex: 0, content: "Merged and deployed." }],
  },
  {
    listIndex: 4,
    title: "Drag-and-drop lists & cards",
    description:
      "dnd-kit integration for reordering lists on the board and cards within/across lists with optimistic UI and server sync.",
    labelIndexes: [1],
    memberIndexes: [1, 2],
    startDateOffsetDays: -25,
    dueDateOffsetDays: -15,
    dueComplete: true,
    coverColor: "#c377e0",
    checklists: [
      {
        title: "Completed work",
        items: [
          { title: "List drag preview", isCompleted: true, assigneeIndex: 2 },
          { title: "Card drop placeholder", isCompleted: true, assigneeIndex: 2 },
          { title: "Reorder API integration", isCompleted: true, assigneeIndex: 1 },
        ],
      },
    ],
    attachments: [
      {
        kind: "LINK",
        url: "https://docs.dndkit.com/",
        filename: "dnd-kit documentation",
      },
    ],
  },
  {
    listIndex: 4,
    title: "Prisma schema & initial migration",
    description:
      "Full relational model: users, workspaces, boards, lists, cards, labels, members, checklists, comments, attachments, activity.",
    labelIndexes: [4],
    memberIndexes: [0, 3],
    startDateOffsetDays: -45,
    dueDateOffsetDays: -40,
    dueComplete: true,
    comments: [
      { userIndex: 3, content: "Seed script covers all relations now." },
      { userIndex: 0, content: "Indexes look good for board detail query." },
    ],
  },
];

function offsetDate(days: number) {
  return new Date(Date.now() + days * DAY_MS);
}

async function main() {
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.label.deleteMany();
  await prisma.boardStar.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await Promise.all(
    users.map(async (user) =>
      prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordHash: await hashPassword(user.password),
        },
      }),
    ),
  );

  const [swaroop, john, alice, demoUser] = createdUsers;

  const workspace = await prisma.workspace.create({
    data: {
      name: "Product Team",
      slug: "product-team",
      members: {
        create: [
          { userId: demoUser!.id, role: "OWNER" },
          { userId: swaroop!.id, role: "ADMIN" },
          { userId: john!.id, role: "MEMBER" },
          { userId: alice!.id, role: "MEMBER" },
        ],
      },
    },
  });

  const board = await prisma.board.create({
    data: {
      title: "Sprint Board — Q2 Launch",
      ownerId: demoUser!.id,
      workspaceId: workspace.id,
      visibility: "WORKSPACE",
      backgroundColor: "#0079bf",
      members: {
        create: [
          { userId: demoUser!.id, role: "ADMIN" },
          { userId: swaroop!.id, role: "ADMIN" },
          { userId: john!.id, role: "MEMBER" },
          { userId: alice!.id, role: "MEMBER" },
        ],
      },
    },
  });

  await prisma.boardStar.createMany({
    data: [
      { userId: demoUser!.id, boardId: board.id },
      { userId: swaroop!.id, boardId: board.id },
    ],
  });

  const lists = await Promise.all(
    listTitles.map((title, index) =>
      prisma.list.create({
        data: {
          boardId: board.id,
          title,
          position: index + 1,
        },
      }),
    ),
  );

  const labels = await Promise.all(
    labelDefinitions.map((label) =>
      prisma.label.create({
        data: {
          boardId: board.id,
          name: label.name,
          color: label.color,
        },
      }),
    ),
  );

  const positionByList = new Map<string, number>();
  for (const list of lists) {
    positionByList.set(list.id, 0);
  }

  const createdCards: { id: string; title: string; archived: boolean }[] = [];

  for (const cardSeed of cardDefinitions) {
    const list = lists[cardSeed.listIndex]!;
    const position = (positionByList.get(list.id) ?? 0) + 1;
    positionByList.set(list.id, position);

    const card = await prisma.card.create({
      data: {
        listId: list.id,
        title: cardSeed.title,
        description: cardSeed.description,
        position,
        status: cardSeed.archived ? "ARCHIVED" : "ACTIVE",
        startDate:
          cardSeed.startDateOffsetDays !== undefined
            ? offsetDate(cardSeed.startDateOffsetDays)
            : null,
        dueDate:
          cardSeed.dueDateOffsetDays !== undefined
            ? offsetDate(cardSeed.dueDateOffsetDays)
            : null,
        dueTime: cardSeed.dueTime ?? null,
        dueComplete: cardSeed.dueComplete ?? false,
        recurring: cardSeed.recurring ?? "NEVER",
        dueDateReminder: cardSeed.dueDateReminder ?? "NONE",
        coverColor: cardSeed.coverColor ?? null,
      },
    });

    createdCards.push({ id: card.id, title: card.title, archived: !!cardSeed.archived });

    for (const labelIndex of cardSeed.labelIndexes) {
      await prisma.cardLabel.create({
        data: { cardId: card.id, labelId: labels[labelIndex]!.id },
      });
    }

    for (const memberIndex of cardSeed.memberIndexes) {
      await prisma.cardMember.create({
        data: { cardId: card.id, userId: createdUsers[memberIndex]!.id },
      });
    }

    for (const checklistSeed of cardSeed.checklists ?? []) {
      const checklist = await prisma.checklist.create({
        data: { cardId: card.id, title: checklistSeed.title },
      });

      await prisma.checklistItem.createMany({
        data: checklistSeed.items.map((item, index) => ({
          checklistId: checklist.id,
          title: item.title,
          position: index + 1,
          isCompleted: item.isCompleted,
          assignedToId:
            item.assigneeIndex !== undefined
              ? createdUsers[item.assigneeIndex]!.id
              : null,
        })),
      });
    }

    for (const comment of cardSeed.comments ?? []) {
      await prisma.comment.create({
        data: {
          cardId: card.id,
          userId: createdUsers[comment.userIndex]!.id,
          content: comment.content,
        },
      });
    }

    for (const attachment of cardSeed.attachments ?? []) {
      await prisma.attachment.create({
        data: {
          cardId: card.id,
          kind: attachment.kind,
          url: attachment.url,
          filename: attachment.filename,
          uploadedById: demoUser!.id,
        },
      });
    }
  }

  const activeCardCount = createdCards.filter((c) => !c.archived).length;
  const archivedCardCount = createdCards.filter((c) => c.archived).length;

  await prisma.activity.createMany({
    data: [
      {
        boardId: board.id,
        userId: demoUser!.id,
        type: "WORKSPACE_CREATED",
        message: `Workspace "${workspace.name}" was created`,
        metadata: { workspaceId: workspace.id },
      },
      {
        boardId: board.id,
        userId: demoUser!.id,
        type: "BOARD_CREATED",
        message: `Board "${board.title}" was created`,
      },
      {
        boardId: board.id,
        userId: demoUser!.id,
        type: "LIST_CREATED",
        message: `List "${listTitles[0]}" was created`,
      },
      {
        boardId: board.id,
        userId: swaroop!.id,
        type: "CARD_CREATED",
        message: `Card "${cardDefinitions[0]!.title}" was added to Backlog`,
        metadata: { listTitle: "Backlog" },
      },
      {
        boardId: board.id,
        userId: john!.id,
        type: "COMMENT_CREATED",
        message: `John commented on "${cardDefinitions[3]!.title}"`,
      },
      {
        boardId: board.id,
        userId: demoUser!.id,
        type: "CARD_ARCHIVED",
        message: `Card "${cardDefinitions[2]!.title}" was archived`,
      },
    ],
  });

  console.log("Database seeded successfully\n");
  console.log("Workspace:", workspace.name);
  console.log("Board:", board.title);
  console.log("Lists:", listTitles.join(", "));
  console.log(`Cards: ${createdCards.length} total (${activeCardCount} active, ${archivedCardCount} archived)`);
  console.log("\nLogin credentials (password for all: password123):");
  for (const user of users) {
    console.log(`  • ${user.name.padEnd(12)} ${user.email}`);
  }
  console.log("\nRecommended demo account: demo@example.com / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
