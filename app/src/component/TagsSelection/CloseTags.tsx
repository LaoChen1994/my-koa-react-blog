import React, { useState, useEffect } from 'react';
import {
  Tag,
  Checkbox,
  Input,
  FormControl,
  FieldUtils,
  Form,
  IInputChangeEvent,
  Notify,
} from 'zent';
import styles from './style.module.scss';

import { IBlogTag } from '../../interface';
import { initTags } from '../../constant';
import { ValidateOption } from 'formulr';

interface Props {
  data?: IBlogTag[];
  layout?: 'vertical' | 'horizontal';
}

export type TNewTags = IBlogTag & { isNew: boolean };

const { makeChangeHandler } = FieldUtils;

export const CloseTags: React.FC<Props> = props => {
  const { data = [] } = props;
  const MAX_TAGS_NUM = 5;

  const tagsData: TNewTags[] = data.map(elem => {
    return {
      ...elem,
      isNew: false
    };
  });

  // 内部用于保存tag的数组
  const [_tagList, _setTagList] = useState<typeof tagsData>([]);
  const [value, SetValue] = useState<string>('');
  //　用于控制checkbox的
  const [checkTags, setCheckTags] = useState<number[]>([]);

  // 注册在上层Form中的参数名
  const targList = Form.useField<TNewTags[]>('tags', []);
  const updateTagList = makeChangeHandler(targList, ValidateOption.Default);

  const handleClose = (tag: TNewTags) => (
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    // 点击tag的关闭按钮 删除tag
    const { isNew, tagId, tagName } = tag;
    let _tglist = _tagList;
    let _checks = checkTags;

    if (!isNew && tagId) {
      // tag来源于历史tag，需要同时取消checkbox的选中情况
      _tglist = _tagList.filter(elem => elem.tagId !== tagId);
      _checks = checkTags.filter(elem => elem !== tagId);
    } else {
      // 来源于新的tag,直接删除即可
      _tglist = _tagList.filter(elem => elem.tagName !== tagName);
    }
    setCheckTags(_checks);
    _setTagList(_tglist);
  };

  const handleCheckbox = (list: number[]) => {
    const isAdd = list.length > checkTags.length;

    if (_tagList.length >= MAX_TAGS_NUM) {
      Notify.error(`最多只能添加${MAX_TAGS_NUM}个标签`);
      return;
    }

    // 增加的情况 和减少的情况分开
    let _list: TNewTags[] = isAdd
      ? [
          ..._tagList,
          tagsData.find(x => x.tagId === list[list.length - 1]) as TNewTags
        ]
      : _tagList.filter(elem => elem.isNew || list.includes(elem.tagId));

    _setTagList(_list);
    setCheckTags(list);
  };

  const handlePressEnter = () => {
    // 添加之前没有的新的标签
    // 最多添加5个标签

    if (_tagList.length >= MAX_TAGS_NUM) {
      Notify.error(`最多只能添加${MAX_TAGS_NUM}个标签`);
      return;
    }

    // 先判断是否该标签已经存在，已存在就不填加重复标签
    const isExistInHistory =
      tagsData.find(elem => elem.tagName === value) ||
      _tagList.find(elem => elem.tagName === value);
    if (!isExistInHistory) {
      const newTags: TNewTags[] = [
        ..._tagList,
        {
          ...initTags,
          isNew: true,
          tagName: value
        }
      ];
      _setTagList(newTags);
      SetValue('');
    } else {
      Notify.error('该文章类别已经存在，请勿重复插入相同标签');
    }
  };

  useEffect(() => {
    updateTagList(_tagList);
  }, [_tagList]);

  return (
    <>
      <FormControl label="文章分类:" required>
        <div className={styles.input}>
          <Input
            value={value}
            width="200px"
            maxLength={10}
            onPressEnter={handlePressEnter}
            onChange={(e: IInputChangeEvent) => {
              SetValue(e.target.value);
            }}
          ></Input>
          <span className={styles.notes}>
            输入新标签名，并回车产生新标签,最多只能插入5个标签
          </span>
        </div>

        {_tagList.map((elem, index) => (
          <Tag
            key={`tag-${index}`}
            closable
            onClose={handleClose(elem)}
            outline
            className={styles.tags}
            theme="green"
            style={{ fontSize: '16px' }}
          >
            {elem.tagName}
          </Tag>
        ))}

        <div className={styles.historyTags}>
          <div className={styles.subtitle}>常用标签:</div>
          {tagsData.length ? (
            <div className={styles.tagsPanel}>
              <Checkbox.Group
                value={checkTags}
                onChange={handleCheckbox}
                className={styles.group}
              >
                {tagsData.map((elem, index) => (
                  <Checkbox
                    value={elem.tagId}
                    key={`tags-selectionTab-${index}`}
                  >
                    {elem.tagName}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </div>
          ) : (
            '暂无'
          )}
        </div>
      </FormControl>
    </>
  );
};
