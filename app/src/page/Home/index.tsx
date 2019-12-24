import React, { useEffect, useContext } from 'react';
import { getHome } from '../../api/home';
import { UserContext } from '../../store/users'


interface Props {}

const Home: React.FC<Props> = () => {

  const {state} = useContext(UserContext);

  useEffect(() => {
    async function getData() {
      await getHome();
    }

    try {
      getData();
    } catch (error) {
      console.log('err=', error);
    }
  }, []);

  return (
    <div>
      Home
    </div>
  );
};

export default Home;
