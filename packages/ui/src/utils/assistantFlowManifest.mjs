const supportedKinds = new Set(['chatflow', 'agentflow'])

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

export const validateAssistantFlowManifest = (manifest, assistantIds = []) => {
    const errors = []
    const associations = Array.isArray(manifest?.associations) ? manifest.associations : []

    associations.forEach((association, index) => {
        if (!isNonEmptyString(association?.assistantId)) {
            errors.push(`Association ${index} must provide a non-empty assistantId`)
        }
        if (!isNonEmptyString(association?.flowId)) {
            errors.push(`Association ${index} must provide a non-empty flowId`)
        }
        if (!supportedKinds.has(association?.kind)) {
            errors.push(`Association ${index} kind must be "chatflow" or "agentflow"`)
        }
    })

    for (const assistantId of new Set(assistantIds)) {
        const associationCount = associations.filter((association) => association?.assistantId === assistantId).length
        if (associationCount !== 1) {
            errors.push(`Assistant "${assistantId}" must have exactly one flow association`)
        }
    }

    return { valid: errors.length === 0, errors }
}

