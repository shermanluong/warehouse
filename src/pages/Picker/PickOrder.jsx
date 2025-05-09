import { useParams } from 'react-router-dom';
import React, { useEffect } from 'react';
import Layout from '../../layouts/layout';
import ListView from '../../components/picker/ListView';
import SingleItemView from '../../components/picker/SingleItemView';
import { useViewPreference } from '../../Context/ViewPreferenceContext';

const PickOrder = () => {
    const { id } = useParams();
    const { view, setView } = useViewPreference();

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        setView(isMobile ? 'single' : 'list');
    }, [setView]);

    return (
        <Layout headerTitle={"Picking"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {view === 'list' ? 
                    <ListView id={id}/>
                    :
                    <SingleItemView id={id}/>
                }
            </div>
        </Layout>
    )
}

export default PickOrder;