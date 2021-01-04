import { EvaluationFunction, serializeUnit } from '..'
import { mergeAllMissing } from '../evaluation'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'
import { ASTNode } from '../AST/types'
import { Context } from '../parsePublicodes'
import { typeWarning } from '../error'
import { convertNodeToUnit } from '../nodeUnits'

export type AbattementNode = {
	explanation: {
		assiette: ASTNode
		abattement: ASTNode
	}
	nodeKind: 'abattement'
}

const evaluateAbattement: EvaluationFunction<'abattement'> = function (node) {
	const assiette = this.evaluateNode(node.explanation.assiette)
	let abattement = this.evaluateNode(node.explanation.abattement)
	const percentageAbattement = serializeUnit(abattement.unit) === '%'
	if (assiette.unit && !percentageAbattement) {
		try {
			abattement = convertNodeToUnit(assiette.unit, abattement)
		} catch (e) {
			typeWarning(
				this.cache._meta.contextRule,
				"Impossible de convertir l'unité de l'abattement avec son assiette",
				e
			)
		}
	}

	const assietteValue = assiette.nodeValue as number
	const abattementValue = abattement.nodeValue as number | null
	const nodeValue = abattement
		? abattementValue == null
			? assietteValue === 0
				? 0
				: null
			: serializeUnit(abattement.unit) === '%'
			? Math.max(0, assietteValue - (abattementValue / 100) * assietteValue)
			: Math.max(0, assietteValue - abattementValue)
		: assietteValue

	return {
		...node,
		nodeValue,
		unit: assiette.unit,
		missingVariables: mergeAllMissing([assiette, abattement]),
		explanation: {
			assiette,
			abattement,
		},
	}
}

export default function parseAbattement(v, context: Context) {
	const explanation = {
		assiette: parse(v.valeur, context),
		abattement: parse(v.abattement, context),
	}
	return {
		explanation,
		nodeKind: parseAbattement.nom,
	}
}

parseAbattement.nom = 'abattement' as const

registerEvaluationFunction(parseAbattement.nom, evaluateAbattement)
