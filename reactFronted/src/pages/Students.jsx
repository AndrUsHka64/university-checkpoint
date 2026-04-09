import { Link, useParams } from "react-router-dom";

const demoStudents = [];

function Students() {
    const { instituteId, groupId } = useParams();

    return (
        <section className="panel">
            <div className="panel-title">
                <p className="eyebrow">Structure</p>
                <h1>Students in group #{groupId}</h1>
            </div>

            <div className="toolbar">
                <Link className="button ghost" to={`/admin/institutes/${instituteId}/groups`}>
                    Back to groups
                </Link>
            </div>

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Card</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Learning form</th>
                            <th>Face</th>
                        </tr>
                    </thead>
                    <tbody>
                        {demoStudents.map((student, index) => (
                            <tr key={student.id}>
                                <td>{index + 1}</td>
                                <td>{student.card_id}</td>
                                <td>
                                    {student.last_name} {student.first_name} {student.patronymic ?? ""}
                                </td>
                                <td>{student.phone ?? "-"}</td>
                                <td>{student.learning_form ?? "-"}</td>
                                <td>{student.has_face_embedding ? "Attached" : "No"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default Students;