import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../layouts/layout';
import PickingList from '../../components/PickingList';

const PickOrder = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchOrder = async () => {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/picker/order/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setOrder(res.data);
        };
        fetchOrder();
    }, [id]);

    if (!order) return <div>Loading...</div>;

    return (
        <Layout headerTitle={"Picking"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Your content */}
                <PickingList order = {order}/>
            </div>
        </Layout>
    )
}

export default PickOrder;