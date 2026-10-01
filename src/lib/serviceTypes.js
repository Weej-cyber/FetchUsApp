// Service type options. WALK_SERVICE_TYPES is what a client books; admin
// forms that also need "Boarding" as a status/category use ALL_SERVICE_TYPES.
export const WALK_SERVICE_TYPES = ['15-min Walk', '30-min Walk', '60-min Walk', 'Drop-In Visit']

export const ALL_SERVICE_TYPES = [...WALK_SERVICE_TYPES, 'Boarding']
