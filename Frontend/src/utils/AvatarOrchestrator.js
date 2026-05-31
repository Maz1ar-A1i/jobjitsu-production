export const AVATAR_ROLES = {
    hr: {
        id: 'hr',
        name: 'Sarah (HR Manager)',
        focus: 'Behavioral & Culture Fit',
        greeting: "Hello! I'm Sarah. I'll be starting our conversation today to learn more about you."
    },
    technical: {
        id: 'technical',
        name: 'Alex (Tech Lead)',
        focus: 'Technical Skills & Problem Solving',
        greeting: "Hi, I'm Alex. I'm here to gauge your technical depth and problem-solving skills."
    },
    team_lead: {
        id: 'team_lead',
        name: 'Mike (Team Lead)',
        focus: 'Collaboration & Soft Skills',
        greeting: "Hey there, I'm Mike. I want to see how you'd fit into our daily workflow and team dynamic."
    }
};

export class AvatarOrchestrator {
    constructor() {
        this.turnOrder = ['hr', 'technical', 'team_lead'];
        this.round = 0;
    }

    /**
     * Determines which avatar should speak next.
     * For now, it's a simple round-robin, but can be enhanced for dynamic interruptions.
     */
    getNextAvatar(currentAvatarId) {
        if (!currentAvatarId) return this.turnOrder[0];

        const currentIndex = this.turnOrder.indexOf(currentAvatarId);
        const nextIndex = (currentIndex + 1) % this.turnOrder.length;

        if (nextIndex === 0) {
            this.round++;
        }

        return this.turnOrder[nextIndex];
    }

    getRole(avatarId) {
        return AVATAR_ROLES[avatarId];
    }

    /**
     * Generates a prompt context for the LLM based on the avatar's role.
     */
    getSystemPrompt(avatarId, domain) {
        const role = AVATAR_ROLES[avatarId];
        return `You are ${role.name}, acting as the ${role.focus} interviewer for a ${domain} role. Keep your questions professional but conversational. Focus strictly on ${role.focus}.`;
    }
}
