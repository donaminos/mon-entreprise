import { EngineContext } from 'Components/utils/EngineContext'
import { useContext, useEffect } from 'react'
import { TargetLine } from './ArtisteAuteur'
import { formatValue } from 'publicodes'
import RuleInput from 'Components/conversation/RuleInput'
import { setSimulationConfig, updateSituation } from 'Actions/actions'
import { useDispatch, useSelector } from 'react-redux'
import emoji from 'react-easy-emoji'
import { ThemeColorsProvider } from 'Components/utils/colors'
import { situationSelector } from 'Selectors/simulationSelectors'
import Animate from 'Components/ui/animate'

const config = {
	situation: {}
}

export default function ISSimulation() {
	const dispatch = useDispatch()
	useEffect(() => {
		dispatch(setSimulationConfig(config as any))
	}, [])

	return (
		<ThemeColorsProvider color="#D12954">
			<ExerciceDate />
			<section className="ui__ plain card">
				<div id="targetSelection">
					<ul className="targets">
						<TargetLine dottedName="entreprise . bénéfice" autoFocus={true} />
					</ul>
				</div>
			</section>

			<Explanations />
		</ThemeColorsProvider>
	)
}

function ExerciceDate() {
	const engine = useContext(EngineContext)
	const debut = engine.evaluate('entreprise . exercice . début')
	const fin = engine.evaluate('entreprise . exercice . fin')
	const dispatch = useDispatch()
	return (
		<p
			css={`
				display: flex;
				justify-content: flex-end;
				opacity: 0.85;
				font-style: italic;

				/* XXX HACKY */
				.step,
				.step > div {
					display: inline;
				}

				input {
					border: none;
					border-radius: 0;
					padding: 0;
					padding-right: -20px;
					padding-bottom: 3px;
					border-bottom: 2px dotted var(--color);
				}
			`}
		>
			<span>
				{emoji('📆')} Exercice du{' '}
				<RuleInput
					dottedName={debut.dottedName}
					value={debut.nodeValue}
					onChange={x => dispatch(updateSituation(debut.dottedName, x))}
				/>{' '}
				au{' '}
				<RuleInput
					dottedName={fin.dottedName}
					value={fin.nodeValue}
					onChange={x => dispatch(updateSituation(fin.dottedName, x))}
				/>
			</span>
		</p>
	)
}

function Explanations() {
	const engine = useContext(EngineContext)
	const is = engine.evaluate('entreprise . impôt sur les sociétés')
	const situation = useSelector(situationSelector)
	const showResult = situation['entreprise . bénéfice']
	if (!showResult) {
		return null
	}
	return (
		<Animate.fromTop>
			<div
				css={`
					text-align: center;
				`}
			>
				<p
					className="ui__ lead card light-bg"
					css={`
						display: inline-block;
						margin: 2rem;
						padding: 1rem 4rem;

						strong {
							font-size: 1.3em;
						}
					`}
				>
					<strong>{formatValue(is, { displayedUnit: '€' })}</strong>
					<br />
					<span className="ui__ notice">
						Montant de l'impôt sur les sociétés
					</span>
				</p>
			</div>
		</Animate.fromTop>
	)
}
