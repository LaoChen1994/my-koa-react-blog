import React, { useEffect, useState, useCallback } from 'react';
import { useRouteMatch } from 'react-router-dom';
import styles from './style.module.scss';
import { getBlogList } from '../../api/blog';
import { TBlogBrief, IUserDetail } from '../../api/interface';
import { BlogCard } from '../../component/BlogCard';
import { usePagination } from '../../hooks/usePagination';
import { getUserDetail } from '../../api/user';
import { DetailBlock } from '../../component/UDetailBlock';
import { Pagination, Notify } from 'zent';
import { PaginationChangeHandler } from 'zent/es/pagination/impl/BasePagination';

interface Props {}

export const MyBlogList: React.FC<Props> = () => {
  const { params } = useRouteMatch<{ userId: string }>();
  const { userId } = params;
  const [myBlogs, setBlogs] = useState<TBlogBrief[]>([]);
  const [pageNumber, setPage] = useState<number>(0);
  const [useInfo, setUserInfo] = useState<IUserDetail>({} as IUserDetail);
  const pageSize = 10;

  const [pagination, setPagination] = usePagination({
    current: 1,
    pageSize,
    total: 0
  });

  const _getListInfo = async (
    pageNumber: number,
    pageSize: number,
    id = userId
  ) => {
    const { data } = await getBlogList(pageSize, pageNumber, +id);
    if (data) {
      data.data &&
        (() => {
          const { blogList, totalNumber = 0 } = data.data;
          setPagination({
            ...pagination,
            total: totalNumber,
            pageSize,
            current: pageNumber+1
          });
          setBlogs(blogList);
        })();
    }
  };

  const _getUserInfo = useCallback(async () => {
    const { data } = await getUserDetail(+userId);
    const { data: userDetail } = data;
    setUserInfo(userDetail);
  }, [userId]);

  useEffect(() => {
    _getUserInfo();
  }, [userId]);

  useEffect(() => {
    _getListInfo(pageNumber, pageSize);
    setPagination({
      ...pagination,
      current: pageNumber+1
    });
  }, [pageNumber]);

  const handlePageChange: PaginationChangeHandler = e => {
    const { current } = e;
    if (pageNumber === current - 1) {
      Notify.warn(`当前页为第${current}页`);
    }
    setPage(current-1);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.b1}>
        <DetailBlock data={useInfo}></DetailBlock>
      </div>
      <div className={styles.b2}>
        <div className={styles.content}>
          {myBlogs.map((elem, index) => (
            <BlogCard data={elem} key={`blog-card-${index}`}></BlogCard>
          ))}
        </div>
        <div className={styles.pagination}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePageChange}
          ></Pagination>
        </div>
      </div>
    </div>
  );
};
