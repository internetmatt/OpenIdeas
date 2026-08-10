const supportedKinds = new Set(['chatflow', 'agentflow'])

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

export const validateAssistantFlowManifest = (manifest, assistantIds = []) => {
    const errors = []
    if (manifest?.schemaVersion !== 1) {
        errors.push('Manifest schemaVersion must be 1')
    }

    const hasAssociations = Array.isArray(manifest?.associations)
    if (!hasAssociations) {
        errors.push('Manifest associations must be an array')
    }
    const associations = hasAssociations ? manifest.associations : []

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

    for (const assistantId of new Set(assistantIds.map((value) => value.trim()).filter(Boolean))) {
        const associationCount = associations.filter((association) => association?.assistantId?.trim() === assistantId).length
        if (associationCount !== 1) {
            errors.push(`Assistant "${assistantId}" must have exactly one flow association`)
        }
    }

    return { valid: errors.length === 0, errors }
}
