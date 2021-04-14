import React from 'react';
import classNames from 'classnames';
import './style.css';

type CheckboxProps = { 
  checkboxVal: boolean, 
  onChangeHandler: any, 
  checkboxLabel: string, 
  id: string, 
  name: string, 
  checkClassName: string
};
const Checkbox = (props: CheckboxProps) => {
  let { checkboxVal, onChangeHandler, checkboxLabel, id, name, checkClassName } = props;
  let checkClass: string;
  if (checkClassName) {
    checkClass = `form ${checkClassName}`
  }
  if (checkboxLabel) {
    return (
      <div className={checkClass}>
        <input type="checkbox" className="list-item-input"
          checked={checkboxVal}
          onChange={ev => onChangeHandler(ev)}
          name={name} />
        {checkboxLabel && (
          <label className="checkbox-label" onClick={ev => onChangeHandler(ev)} id={id}>{checkboxLabel}</label>
        )}
      </div>
    )
  }

  return (
    <div className={checkClass}>
      <input checked={checkboxVal} type="checkbox" className="list-item-input"
        onChange={ev => onChangeHandler(ev)} name={name}
        />
      <label onClick={ev => onChangeHandler(ev)} id={id} />
    </div>
  )
}

export default Checkbox;