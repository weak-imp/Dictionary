import { ActionIcon, Button, LoadingOverlay } from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { SideMenu } from "src/04_entities/side-menu";
import { getAllFields } from "src/05_shared/api/field/get-all-fields";
import { getAllSets } from "src/05_shared/api/set-of-fields/get-all-sets";
import { useDynamicFields } from "src/05_shared/lib/useDynamicProps";
import { BottomBtnGroup } from "src/05_shared/ui/block-buttons/bottom-btn-group";
import { DashedBtn } from "src/05_shared/ui/buttons/dashed-btn";
import { Header } from "src/05_shared/ui/header";
import { ListEntities } from "src/05_shared/ui/list-entities/list";
import { ListWrapEntities } from "src/05_shared/ui/list-entities/list-wrap";
import { MainContainer } from "src/05_shared/ui/main-container";
import { useAddCard } from "../../../04_entities/card/api/use-add-card";
import classes from "./classes.module.css";
import { IconArrowBackUp } from "@tabler/icons-react";
import { EditableField } from "src/04_entities/card";
import { ROOT_PATH } from "src/05_shared/api/query-const";

export function AddCard() {
  const { data: fields } = useSuspenseQuery(getAllFields());
  const { data: sets } = useSuspenseQuery(getAllSets());
  const defaultSet = sets.find((set) => set.defaultSet);
  const fieldNames = useMemo(() => fields.map((field) => field.name), [fields]);
  const navigate = useNavigate();
  const addWordMutation = useAddCard();

  const {
    dynamicFields,
    handleFieldUpdate,
    handleFieldDelete,
    resetDynamicFields,
    addEmptyField,
  } = useDynamicFields(
    defaultSet?.fields.map((field) => ({ name: field.name, value: "" })) || []
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    addWordMutation.mutate(
      { fields: dynamicFields },
      {
        onSuccess: () => {
          resetDynamicFields();
          navigate({ to: ROOT_PATH });
        },
      }
    );
  }

  const btnGroup = (
    <ActionIcon.Group>
      <ActionIcon component={Link} to={ROOT_PATH}>
        <IconArrowBackUp />
      </ActionIcon>
    </ActionIcon.Group>
  );

  return (
    <>
      <Header title="Add card" menu={<SideMenu />} btnGroup={btnGroup} />
      <MainContainer>
        <LoadingOverlay
          visible={addWordMutation.isPending}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <form onSubmit={(e) => handleSubmit(e)} className={classes["form"]}>
          <ListWrapEntities>
            <ListEntities>
              {dynamicFields.map((field, index) => {
                return (
                  <EditableField
                    key={index}
                    initialName={field.name}
                    initialValue={field.value}
                    fieldNames={fieldNames}
                    editable={true}
                    onUpdate={handleFieldUpdate}
                    onDelete={handleFieldDelete}
                    index={index}
                  />
                );
              })}
            </ListEntities>
          </ListWrapEntities>

          <BottomBtnGroup>
            <DashedBtn onClick={addEmptyField}>Add a field</DashedBtn>
            <Button type="submit">Create</Button>
          </BottomBtnGroup>
        </form>
      </MainContainer>
    </>
  );
}
