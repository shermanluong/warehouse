import { useParams } from 'react-router-dom';
import React from 'react';
import Layout from '../../layouts/layout';
import ListView from '../../components/picker/ListView';

const PickOrder = () => {
    const { id } = useParams();

    return (
        <Layout headerTitle={"Picking"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <ListView 
                    id={id}
                />
            </div>
        </Layout>
    )
}

export default PickOrder;