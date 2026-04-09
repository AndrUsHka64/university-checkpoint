import { Link, useParams } from "react-router-dom";

function AddStudent() {
    const { instituteId, groupId } = useParams();

    return (
        <section className="panel">
            <div className="panel-title">
                <p className="eyebrow">Registration</p>
                <h1>Add student</h1>
            </div>

            <div className="toolbar">
                <Link
                    className="button ghost"
                    to={`/admin/institutes/${instituteId}/groups/${groupId}/students`}
                >
                    Back to students
                </Link>
            </div>
        </section>
    );
}

export default AddStudent;