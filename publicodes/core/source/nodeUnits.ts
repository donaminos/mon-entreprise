import { mapTemporal } from './temporal'
import { convertUnit, serializeUnit, simplifyUnit } from './units'
import { ASTNode, EvaluatedNode, Unit } from './AST/types'

export function simplifyNodeUnit(node) {
	if (!node.unit) {
		return node
	}
	const unit = simplifyUnit(node.unit)

	return convertNodeToUnit(unit, node)
}

export function convertNodeToUnit<Node extends EvaluatedNode = EvaluatedNode>(
	to: Unit | undefined,
	node: Node
): Node {
	const temporalValue =
		node.temporalValue && node.unit
			? mapTemporal(
					(value) => convertUnit(node.unit, to, value as number),
					node.temporalValue
			  )
			: node.temporalValue
	return {
		...node,
		nodeValue:
			node.unit && typeof node.nodeValue === 'number'
				? convertUnit(node.unit, to, node.nodeValue)
				: node.nodeValue,
		...(temporalValue && { temporalValue }),
		unit: to,
	}
}
