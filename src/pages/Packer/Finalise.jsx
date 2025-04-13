import Layout from '../../layouts/layout';
import PackingList from '../../components/PackingList';

export default function Finalise() {
    return (
        <Layout headerTitle={"Packing"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Your content */}
                    <PackingList />
                </div>
        </Layout>     
    )
}
