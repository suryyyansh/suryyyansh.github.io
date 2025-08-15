// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

// 2. Import loader(s)
import { glob } from 'astro/loaders';

// 3. Define your collection(s)
const htb_machines = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./writeups/htb/machines"
    }),
    schema: z.object({
        name: z.string(),
        difficulty: z.enum(['Very Easy', 'Easy', 'Intermediate', 'Medium', 'Hard', 'Very Hard', 'Insane', 'Brainfuck']),
        author: z.string(),
        ipAddress: z.string(),
        dateAttempted: z.coerce.date(),
        tags: z.array(z.string()),
    })
});

const htb_challenges = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./writeups/htb/challenges"
    }),
    schema: z.object({
        name: z.string(),
        genre: z.enum(['Web', 'Reversing', 'Binary Exploitation']),
        difficulty: z.enum(['Very Easy', 'Easy', 'Intermediate', 'Medium', 'Hard', 'Very Hard', 'Insane', 'Brainfuck']),
        dateAttempted: z.coerce.date(),
        author: z.string(),
        tags: z.array(z.string()),
    })
});

const ctf_challenges = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./writeups/ctf"
    }),
    schema: z.object({
        name: z.string(),
        year: z.string().optional(),
        dateAttempted: z.coerce.date(),
        by: z.string(),
        tags: z.array(z.string())
    })
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { ctf_challenges, htb_machines, htb_challenges };