import React, {
  useEffect,
  useContext,
  useState,
  useCallback,
  createRef
} from "react";
import { getHome, getUndoList, getSearchKey } from "../../api/home";
import { getBlogList } from "../../api/blog";
import { UserContext } from "../../store/users";
import Welcome from "./Welcome";
import style from "./style.module.scss";
import { useHistory } from "react-router-dom";
import { Button, Collapse, Icon } from "zent";
import { TBlogBrief, ITodoInfo } from "../../api/interface";
import { BlogCard } from "../../component/BlogCard";
import {
  MyWaterfall,
  IWaterfallProps,
  IWaterfallRef,
  WaterfallRef
} from "../../component/MyWaterFall";
import { SearchInput } from "../../component/SearchInput";
import { usePrevious } from "../../hooks/usePrevious";

interface Props {}

const Home: React.FC<Props> = () => {
  const history = useHistory();

  const { state } = useContext(UserContext);
  const waterRef = createRef<IWaterfallRef>();

  const [blogList, setBlogList] = useState<TBlogBrief[]>([]);
  const [undoList, setUndoList] = useState<ITodoInfo[]>([]);
  const [isSearch, setSearch] = useState<boolean>(false);
  const prevState = usePrevious<boolean>(isSearch);
  const [lastValue, setLastValue] = useState<string>("");

  const [active, setActive] = useState<string | string[]>("map-0");
  const pageSize = 5;

  async function initBlogList() {
    const { data } = await getBlogList(pageSize, 0);
    if (data) {
      const { blogList } = data.data;
      setBlogList(blogList);
      isSearch && setSearch(false);
    }
  }

  useEffect(() => {
    async function getData() {
      await getHome();
    }

    try {
      getData();
      initBlogList();
    } catch (error) {
      console.log("err=", error);
    }
  }, []);

  useEffect(() => {
    async function _getUndoList() {
      const { data } = await getUndoList(state.userId);
      const { undoList } = data.data;
      setUndoList(undoList);
    }

    _getUndoList();
  }, [state.userId]);

  useEffect(() => {
    const { current } = waterRef;
    console.log("prev=", prevState);
    console.log("curr=", isSearch);
    if (current && prevState !== isSearch) {
      const { resetPos } = current;
      resetPos();
    }
  }, [isSearch, waterRef, prevState]);

  const linkTodoList = () => {
    history.push("/todoList");
  };

  const linkToBlog = () => {
    history.push("/blog");
  };

  const linkToWrite = () => {
    history.push("/blog/blogEdit");
  };

  const handleColChange = (value: string | string[]) => {
    setActive(value);
  };

  const getSearchRes = async (searchValue: string) => {
    const { data } = await getSearchKey(searchValue);
    const { blogList } = data.data;
    setLastValue(searchValue);
    !isSearch && setSearch(true);
    setBlogList(blogList);
  };

  /**
   * 留作扩展用
   */
  const handlePanelChange = (key: string, isActive: boolean) => {
    console.log(key, isActive);
  };

  const renderUndoCard = useCallback(() => {
    return (
      <div className={style.undoCardWrap}>
        <Collapse
          activeKey={active}
          onChange={handleColChange}
          accordion
          panelTitleBackground="none"
        >
          {undoList &&
            undoList.map((elem, index) => (
              <Collapse.Panel
                title={elem.todoTitle}
                key={`map-${index}`}
                panelKey={`map-${index}`}
                onChange={handlePanelChange}
                showArrow={false}
              >
                <div>
                  <div className={style.cardTitle}>截止日期: </div>
                  <span
                    className={
                      new Date(elem.endTime) < new Date()
                        ? style.errorEvent
                        : style.warning
                    }
                  >
                    {elem.endTime}
                  </span>
                </div>
                <div>
                  <div className={style.cardTitle}>事项简介: </div>
                  <p className={style.itemBrief}>{elem.todoItem}</p>
                </div>
              </Collapse.Panel>
            ))}
        </Collapse>
        {!undoList.length && (
          <div className={style.emptyNotes}>
            <Icon type="expand-customer" /> <span>当前代办列表为空～</span>
          </div>
        )}
        <div className={style.panelControl}>
          <span onClick={linkTodoList}>
            <Icon type="checkin-o" /> 前去处理
          </span>
        </div>
      </div>
    );
  }, [undoList, active, linkTodoList]);

  const handleScrolLoading: IWaterfallProps["handleLoading"] = useCallback(
    async (page, resolve, reject) => {
      if (resolve) {
        const { data } = isSearch
          ? await getSearchKey(lastValue, pageSize, page + 1, state.userId)
          : await getBlogList(pageSize, page);
        const { data: _data } = data;
        const { blogList: _bl } = _data;

        if (_bl && _bl.length) {
          resolve(true);
          setBlogList([...blogList, ..._bl]);
        } else {
          reject && reject("已经到底啦～");
        }
      }
    },
    [blogList, lastValue]
  );

  return (
    <div className={style.show}>
      <div className={style.banner}>
        <Welcome></Welcome>
      </div>
      <div className={style.controller}>
        <Button type="primary" size="large" onClick={linkTodoList}>
          计划安排
        </Button>
        <Button
          type="success"
          outline
          size="large"
          style={{ marginLeft: "30px", width: "120px" }}
          onClick={linkToBlog}
        >
          我的博客
        </Button>
        <Button
          type="warning"
          onClick={linkToWrite}
          size="large"
          outline
          style={{ marginLeft: "30px", width: "120px" }}
        >
          写博客
        </Button>
      </div>

      <div className={style.contentList}>
        <WaterfallRef
          handleLoading={handleScrolLoading}
          className={style.blogList}
          ref={waterRef}
        >
          <div className={style.contentHeader}>
            <div className={style.itemTitle}>最新博客</div>
            <SearchInput
              placeholder="请输入博文关键字"
              fetchData={getSearchRes}
              fetchDataInEmpty={initBlogList}
            ></SearchInput>
          </div>

          <div className={style.blogBody}>
            {blogList.map((elem, index) => (
              <BlogCard data={elem} key={`blog-card-${index}`}></BlogCard>
            ))}
          </div>
        </WaterfallRef>
        <div className={style.left}>
          <div className={style.todoList}>
            <div className={style.itemTitle}>代办事项</div>
            {renderUndoCard()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
