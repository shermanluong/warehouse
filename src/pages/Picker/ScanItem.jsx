import Layout from '../../layouts/layout';
import PickingList from '../../components/PickingList';

export default function ScanItem() {
    return (
        <Layout headerTitle={"Picking"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Your content */}
                <PickingList />
            </div>
        </Layout>
    )
}
