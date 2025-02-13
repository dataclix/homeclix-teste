// components/UniversalFileViewer.jsx
import { Button, Image, Modal, Space } from 'antd';
import { useState } from 'react';
import {
    DownloadOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    SwapOutlined,
    UndoOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
} from '@ant-design/icons';
import { IoMdClose } from 'react-icons/io';
interface Props {
    fileUrl: string;
    fileType: string;
    nome: string;
    descricao: string;
}
const UniversalFileViewer = ({ fileUrl, fileType, nome, descricao }: Props) => {
    console.log(fileUrl)
    const [open, setOpen] = useState<boolean>(false)
    const renderFile = () => {
        const tipo = fileType.split('/')
        console.log([tipo[0], tipo[1]])
        switch (tipo[0]) {
            case 'application':
                switch (tipo[1]) {
                    case 'pdf':
                        return (
                            <div>
                                {open === true && (
                                    <Modal open={open} width={1200} centered title={false} footer={false} onCancel={() => setOpen(false)} closeIcon={<IoMdClose size={24} color="white" className="bg-black rounded-full" />}>
                                        <p className='absolute text-center mx-auto font-bold text-lg inset-0 h-10 pt-4 text-white '>{nome}</p>
                                        <iframe className='w-[1200px] h-[650px] rounded-md' src={fileUrl} />
                                    </Modal>
                                )}
                                <button onClick={() => setOpen(true)}>
                                    <img src='/images/tipos/pdf.png' className='max-h-[150px] mx-auto' />
                                    <p className='text-center font-bold'>{nome}</p>
                                    <p className='text-justify text-sm'>{descricao}</p>
                                </button>

                            </div>
                        )
                    case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
                        return (
                            <div>
                                <a href={fileUrl} download target='_blank'>
                                    <img src='/images/tipos/docx.png' className='max-h-[150px] mx-auto' />
                                    <p className='text-center mt-1 font-bold'>{nome}</p>
                                    <p className='text-justify text-sm'>{descricao}</p>
                                </a>

                            </div>
                        )
                    case 'vnd.ms-excel':
                        return (
                            <div>
                                <a href={fileUrl} download target='_blank'>
                                    <img src='/images/tipos/xls.png' className='max-h-[150px] mx-auto' />
                                    <p className='text-center mt-1 font-bold'>{nome}</p>
                                    <p className='text-justify text-sm'>{descricao}</p>
                                </a>

                            </div>
                        )
                    case 'vnd.ms-powerpoint':
                        return (
                            <div>
                                <a href={fileUrl} download target='_blank'>
                                    <img src='/images/tipos/ppt.png' className='max-h-[150px] mx-auto' />
                                    <p className='text-center mt-1 font-bold'>{nome}</p>
                                    <p className='text-justify text-sm'>{descricao}</p>
                                </a>

                            </div>
                        )
                    default:
                        return (
                            <div>
                                <a href={fileUrl} download target='_blank'>
                                    <img src='/images/tipos/indefinido.png' className='max-h-[150px] mx-auto' />
                                    <p className='text-center font-bold'>{nome}</p>
                                    <p className='text-justify text-sm'>{descricao}</p>
                                </a>

                            </div>
                        )
                }
            case 'image':
                return (
                    <div>
                        <div className='flex justify-center'>
                            <Image
                                src={fileUrl} className='max-h-[150px] '
                                title={nome}
                                preview={{
                                    toolbarRender: (
                                        _,
                                        {
                                            transform: { scale },
                                            actions: {
                                                onFlipY,
                                                onFlipX,
                                                onRotateLeft,
                                                onRotateRight,
                                                onZoomOut,
                                                onZoomIn
                                            },
                                        },
                                    ) => (
                                        <Space size={14} className="toolbar-wrapper">
                                            <a href={fileUrl} download target='_blank'>
                                                <Button icon={<DownloadOutlined />} />
                                            </a>

                                            <Button icon={<SwapOutlined />} onClick={onFlipY} style={{ fontSize: '20px' }} />
                                            <Button icon={<SwapOutlined />} onClick={onFlipX} style={{ fontSize: '20px' }} />
                                            <Button icon={<RotateLeftOutlined />} onClick={onRotateLeft} style={{ fontSize: '20px' }} />
                                            <Button icon={<RotateRightOutlined />} onClick={onRotateRight} style={{ fontSize: '20px' }} />
                                            <Button icon={<ZoomOutOutlined />} disabled={scale === 1} onClick={onZoomOut} style={{ fontSize: '20px' }} />
                                            <Button icon={<ZoomInOutlined />} disabled={scale === 50} onClick={onZoomIn} style={{ fontSize: '20px' }} />
                                        </Space>
                                    ),
                                }}

                            />
                        </div>

                        <p className='text-center font-bold'>{nome}</p>
                        <p className='text-justify text-sm'>{descricao}</p>
                    </div>
                )

            case 'video':
                return (
                    <div>
                        {open === true && (
                            <Modal open={open} width={800} centered title={false} footer={false} onCancel={() => setOpen(false)} closeIcon={<IoMdClose size={24} color="white" className="bg-black rounded-full" />}>
                                <p className='absolute text-center mx-auto font-bold text-lg inset-0 h-10 pt-4 text-white '>{nome}</p>
                                <iframe className='w-[800px] h-[600px] rounded-md' src={fileUrl} />
                            </Modal>
                        )}
                        <button onClick={() => setOpen(true)}>
                            <video src={fileUrl} className='mx-auto' />
                            <p className='text-center font-bold'>{nome}</p>
                            <p className='text-justify text-sm'>{descricao}</p>
                        </button>

                    </div>
                )

            case 'text':
                switch (tipo[1]) {
                    case 'csv':
                        return (
                            <div>
                                <a href={fileUrl} download target='_blank'>
                                    <img src='/images/tipos/csv.png' className='max-h-[150px] mx-auto' />
                                    <p className='text-center mt-1 font-bold'>{nome}</p>
                                    <p className='text-justify text-sm'>{descricao}</p>
                                </a>

                            </div>
                        )
                }
            default:
                return (
                    <div>
                        <a href={fileUrl} download target='_blank'>
                            <img src='/images/tipos/indefinido.png' className='max-h-[150px] mx-auto' />
                            <p className='text-center font-bold'>{nome}</p>
                            <p className='text-justify text-sm'>{descricao}</p>
                        </a>

                    </div>
                )
        }
    };

    return <div>{renderFile()}</div>;
};

export default UniversalFileViewer;