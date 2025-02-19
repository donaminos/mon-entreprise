import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { bonus, mergeMissing } from '../evaluation'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'
import { EvaluatedNode } from '../AST/types'

export type ParDéfautNode = {
	explanation: {
		valeur: ASTNode
		parDéfaut: ASTNode
	}
	nodeKind: 'par défaut'
}

const evaluate: EvaluationFunction<'par défaut'> = function (node) {
	const explanation: {
		parDéfaut: EvaluatedNode | ASTNode
		valeur: EvaluatedNode | ASTNode
	} = { ...node.explanation }
	let valeur = this.evaluateNode(explanation.valeur)
	explanation.valeur = valeur
	if (valeur.nodeValue === null) {
		valeur = this.evaluateNode(explanation.parDéfaut)
		explanation.parDéfaut = valeur
	}

	return {
		...node,
		nodeValue: valeur.nodeValue,
		explanation,
		missingVariables: mergeMissing(
			bonus((explanation.valeur as EvaluatedNode).missingVariables),
			'missingVariables' in explanation.parDéfaut
				? explanation.parDéfaut.missingVariables
				: {}
		),
		...('unit' in valeur && { unit: valeur.unit }),
	}
}

export default function parseParDéfaut(v, context) {
	const explanation = {
		valeur: parse(v.valeur, context),
		parDéfaut: parse(v['par défaut'], context),
	}
	return {
		explanation,
		nodeKind: parseParDéfaut.nom,
	} as ParDéfautNode
}

parseParDéfaut.nom = 'par défaut' as const

registerEvaluationFunction(parseParDéfaut.nom, evaluate)
