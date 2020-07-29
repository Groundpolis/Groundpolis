export const notificationTypes = ['follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'pollVote', 'receiveFollowRequest', 'followRequestAccepted', 'groupInvited', 'app'] as const;

export const noteVisibilities = ['public', 'home', 'followers', 'specified', 'users'] as const;

export const mutedNoteReasons = ['word', 'manual', 'spam', 'other'] as const;

export type NoteVisibility = typeof noteVisibilities[number];

export type NotificationType = typeof notificationTypes[number];

export type MutedNoteReasons = typeof mutedNoteReasons[number];
