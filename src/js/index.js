import { useQuery, gql } from '@apollo/client';

const GET_MY_COURSES = gql`
  query GetMyCourses {
    myCourses {
      id
      code
      title
    }
  }
`;

function StudentDashboard() {
  const { loading, error, data } = useQuery(GET_MY_COURSES);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <div>
      <h2>My Courses</h2>
      <ul>{data.myCourses.map(c => <li key={c.id}>{c.code} - {c.title}</li>)}</ul>
    </div>
  );
}