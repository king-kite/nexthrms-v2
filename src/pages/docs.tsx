import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

import Title from '../utils/components/title';

const DynamicDocComponent = dynamic<any>(import('../containers/docs'), {
	ssr: false,
});

function ApiDoc() {
	return (
		<>
			<Title title="KiteHRMS Swagger Documentation" />
			<DynamicDocComponent />
		</>
	);
}

ApiDoc.noWrapper = true;

export default ApiDoc;
